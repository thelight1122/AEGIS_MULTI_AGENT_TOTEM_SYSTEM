import { createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import yauzl from "yauzl";

const root = process.cwd();
const vsixPath = join(root, "dist", "aegis-totem-vscode-0.1.1.vsix");
const extensionSourcePath = join(root, "vscode-extension", "extension.js");

function fail(message) {
  console.error(`VS Code QA failed: ${message}`);
  process.exit(1);
}

function openZip(path) {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, (error, zip) => {
      if (error) reject(error);
      else resolve(zip);
    });
  });
}

async function readZip(path) {
  const zip = await openZip(path);
  const files = [];
  const contents = new Map();

  return new Promise((resolve, reject) => {
    zip.readEntry();
    zip.on("entry", (entry) => {
      files.push(entry.fileName);
      if (entry.fileName === "extension/package.json") {
        zip.openReadStream(entry, (error, stream) => {
          if (error) return reject(error);
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => {
            contents.set(entry.fileName, Buffer.concat(chunks).toString("utf8"));
            zip.readEntry();
          });
        });
      } else {
        zip.readEntry();
      }
    });
    zip.on("error", reject);
    zip.on("end", () => resolve({ files, contents }));
  });
}

function requireIncluded(files, expected) {
  for (const file of expected) {
    if (!files.includes(file)) fail(`missing ${file} from VSIX package`);
  }
}

function requireCommands(manifest, expected) {
  const commands = new Set(manifest.contributes?.commands?.map((command) => command.command) ?? []);
  for (const command of expected) {
    if (!commands.has(command)) fail(`missing command ${command}`);
  }
}

function requireSourceContains(source, expected) {
  for (const text of expected) {
    if (!source.includes(text)) fail(`extension source missing ${text}`);
  }
}

function extractZip(path, destination) {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, (error, zip) => {
      if (error) return reject(error);
      zip.readEntry();
      zip.on("entry", (entry) => {
        const outputPath = normalize(join(destination, entry.fileName));
        const safeRoot = normalize(destination + "/");
        if (outputPath !== normalize(destination) && !outputPath.startsWith(safeRoot)) {
          return reject(new Error(`unsafe ZIP path ${entry.fileName}`));
        }
        if (entry.fileName.endsWith("/")) {
          mkdirSync(outputPath, { recursive: true });
          zip.readEntry();
          return;
        }
        mkdirSync(dirname(outputPath), { recursive: true });
        zip.openReadStream(entry, (streamError, stream) => {
          if (streamError) return reject(streamError);
          const output = createWriteStream(outputPath);
          stream.on("error", reject);
          output.on("error", reject);
          output.on("finish", () => zip.readEntry());
          stream.pipe(output);
        });
      });
      zip.on("error", reject);
      zip.on("end", resolve);
    });
  });
}

async function requireBundledCliSmoke() {
  const sandbox = mkdtempSync(join(tmpdir(), "aegis-vscode-qa-"));
  try {
    const extractDir = join(sandbox, "extract");
    const repoDir = join(sandbox, "repo");
    mkdirSync(extractDir, { recursive: true });
    mkdirSync(join(repoDir, "src"), { recursive: true });
    await extractZip(vsixPath, extractDir);
    const cliPath = join(extractDir, "extension", "cli-dist", "src", "cli.js");
    const version = spawnSync(process.execPath, [cliPath, "--version"], { cwd: repoDir, encoding: "utf8" });
    if (version.status !== 0) fail(`bundled CLI version failed: ${version.stderr || version.stdout}`);
    if (version.stdout.trim() !== "0.1.1") fail(`bundled CLI version mismatch: ${version.stdout.trim()}`);
    const start = spawnSync(process.execPath, [cliPath, "start", "--json"], { cwd: repoDir, encoding: "utf8" });
    if (start.status !== 0) fail(`bundled CLI start failed: ${start.stderr || start.stdout}`);
    const result = JSON.parse(start.stdout);
    if (!result.ready || !existsSync(join(repoDir, "ROOT_TOTEM.md"))) {
      fail("bundled CLI start smoke did not initialize the temporary repository");
    }
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

if (!existsSync(vsixPath)) {
  fail(`expected package at ${vsixPath}`);
}

const { files, contents } = await readZip(vsixPath);
requireIncluded(files, [
  "extension/package.json",
  "extension/extension.js",
  "extension/cli-dist/package.json",
  "extension/cli-dist/src/cli.js",
  "extension/cli-dist/node_modules/commander/package.json",
  "extension/cli-dist/node_modules/zod/package.json",
  "extension/media/aegis-totem-icon.png",
  "extension/readme.md",
  "extension/LICENSE.txt"
]);

const manifestText = contents.get("extension/package.json");
if (!manifestText) fail("missing extension/package.json content from VSIX package");
const manifest = JSON.parse(manifestText);

if (manifest.name !== "aegis-totem-vscode") fail(`unexpected extension name ${manifest.name}`);
if (manifest.publisher !== "thelight1122") fail(`unexpected publisher ${manifest.publisher}`);
if (manifest.main !== "./extension.js") fail(`unexpected main ${manifest.main}`);
if (manifest.icon !== "media/aegis-totem-icon.png") fail(`unexpected extension icon ${manifest.icon}`);

const activityBarContainers = manifest.contributes?.viewsContainers?.activitybar ?? [];
if (!activityBarContainers.some((container) =>
  container.id === "aegisTotem" &&
  container.title === "AEGIS Totem" &&
  container.icon === "media/aegis-totem-icon.png"
)) {
  fail("missing AEGIS Totem Activity Bar container icon");
}

const views = manifest.contributes?.views?.aegisTotem ?? [];
if (!views.some((view) => view.id === "aegisTotemView")) {
  fail("missing aegisTotemView in AEGIS Totem Activity Bar container");
}
const viewsWelcome = manifest.contributes?.viewsWelcome ?? [];
if (!viewsWelcome.some((welcome) => welcome.view === "aegisTotemView" && welcome.contents?.includes("Initialize System"))) {
  fail("missing Initialize System welcome action for aegisTotemView");
}
const viewTitleMenu = manifest.contributes?.menus?.["view/title"] ?? [];
if (!viewTitleMenu.some((item) => item.command === "aegisTotem.initialize" && item.when === "view == aegisTotemView")) {
  fail("missing Initialize System view title button");
}

requireCommands(manifest, [
  "aegisTotem.refresh",
  "aegisTotem.start",
  "aegisTotem.initialize",
  "aegisTotem.openRoot",
  "aegisTotem.status",
  "aegisTotem.list",
  "aegisTotem.analytics",
  "aegisTotem.validate",
  "aegisTotem.doctor",
  "aegisTotem.liveTest",
  "aegisTotem.sendMessage",
  "aegisTotem.appendFolderUpdate"
]);

const source = readFileSync(extensionSourcePath, "utf8");
requireSourceContains(source, [
  "aegis-totem",
  "cliInvocation",
  "cli-dist",
  "commandItem",
  "Initialize System",
  "Run Doctor",
  "Show Status",
  "Show List",
  "Show Analytics",
  "Live Test Checklist",
  "createFileSystemWatcher",
  "totem",
  "aegisTotem.start",
  "aegisTotem.initialize",
  '"start"',
  '"--json"',
  "seededFolderTotems",
  "Folder Totems",
  "Agent Lanes",
  "AEGIS Totem List",
  "list",
  "analytics",
  "--json",
  "createWebviewPanel",
  "AEGIS Totem Analytics",
  "AEGIS Totem Doctor",
  "doctor",
  "doctorHtml",
  "openDoctorPanel",
  "await openDoctorPanel(context);",
  "liveTestHtml",
  "AEGIS Totem Live Test Checklist",
  "Bundled VSIX runtime",
  "Readiness",
  "placeHolder",
  "lane",
  "message",
  "totem",
  "append",
  ".aegis/lanes"
]);

await requireBundledCliSmoke();

console.log(`VS Code QA passed: ${files.length} packaged files, ${manifest.contributes.commands.length} commands, 1 Activity Bar view.`);
