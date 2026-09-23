import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const vsixPath = join(root, "dist", "aegis-totem-vscode-0.1.0.vsix");
const extensionSourcePath = join(root, "vscode-extension", "extension.js");

function fail(message) {
  console.error(`VS Code QA failed: ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    shell: false
  });

  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail(result.stderr || result.stdout || `${command} exited with ${result.status}`);
  return result.stdout;
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

const files = run("tar", ["-tf", vsixPath]).trim().split(/\r?\n/).filter(Boolean);
requireIncluded(files, [
  "extension/package.json",
  "extension/extension.js",
  "extension/readme.md",
  "extension/LICENSE.txt"
]);

const manifestText = run("tar", ["-xOf", vsixPath, "extension/package.json"]);
const manifest = JSON.parse(manifestText);

if (manifest.name !== "aegis-totem-vscode") fail(`unexpected extension name ${manifest.name}`);
if (manifest.publisher !== "thelight1122") fail(`unexpected publisher ${manifest.publisher}`);
if (manifest.main !== "./extension.js") fail(`unexpected main ${manifest.main}`);

const views = manifest.contributes?.views?.explorer ?? [];
if (!views.some((view) => view.id === "aegisTotemView")) {
  fail("missing aegisTotemView Explorer view");
}

requireCommands(manifest, [
  "aegisTotem.refresh",
  "aegisTotem.openRoot",
  "aegisTotem.status",
  "aegisTotem.validate",
  "aegisTotem.sendMessage",
  "aegisTotem.appendFolderUpdate"
]);

const source = readFileSync(extensionSourcePath, "utf8");
requireSourceContains(source, [
  "aegis-totem",
  "lane",
  "message",
  "totem",
  "append",
  ".aegis/lanes"
]);

console.log(`VS Code QA passed: ${files.length} packaged files, ${manifest.contributes.commands.length} commands, 1 Explorer view.`);
