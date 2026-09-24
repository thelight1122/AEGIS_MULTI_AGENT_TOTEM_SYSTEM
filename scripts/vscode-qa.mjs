import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

if (!existsSync(vsixPath)) {
  fail(`expected package at ${vsixPath}`);
}

const { files, contents } = await readZip(vsixPath);
requireIncluded(files, [
  "extension/package.json",
  "extension/extension.js",
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

const views = manifest.contributes?.views?.explorer ?? [];
if (!views.some((view) => view.id === "aegisTotemView")) {
  fail("missing aegisTotemView Explorer view");
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
  "aegisTotem.sendMessage",
  "aegisTotem.appendFolderUpdate"
]);

const source = readFileSync(extensionSourcePath, "utf8");
requireSourceContains(source, [
  "aegis-totem",
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
  "await openDoctorPanel();",
  "Readiness",
  "placeHolder",
  "lane",
  "message",
  "totem",
  "append",
  ".aegis/lanes"
]);

console.log(`VS Code QA passed: ${files.length} packaged files, ${manifest.contributes.commands.length} commands, 1 Explorer view.`);
