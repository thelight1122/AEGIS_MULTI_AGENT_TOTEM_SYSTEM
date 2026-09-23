import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const releaseTag = `v${packageJson.version}-alpha.1`;
const releaseNotesPath = join(root, "docs", "releases", `${releaseTag}.md`);
const requiredPackageFiles = ["dist/src", "README.md", "LICENSE"];
const requiredScripts = [
  "alpha:check",
  "local-install:qa",
  "mcp:qa",
  "vscode:qa",
  "release:preflight"
];

function fail(message) {
  console.error(`Release preflight failed: ${message}`);
  process.exit(1);
}

function requireFile(path, label) {
  if (!existsSync(path)) fail(`missing ${label}: ${path}`);
}

if (packageJson.name !== "aegis-totem") fail(`unexpected package name ${packageJson.name}`);
if (packageJson.version !== "0.1.0") fail(`unexpected version ${packageJson.version}`);
if (packageJson.license !== "MIT") fail(`unexpected license ${packageJson.license}`);
if (packageJson.bin?.["aegis-totem"] !== "./dist/src/cli.js") fail("missing aegis-totem bin target");

for (const file of requiredPackageFiles) {
  if (!packageJson.files?.includes(file)) fail(`package.json files missing ${file}`);
}

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) fail(`missing npm script ${script}`);
}

requireFile(join(root, "dist", "src", "cli.js"), "built CLI");
requireFile(join(root, "dist", "src", "mcp-server.js"), "built MCP server");
requireFile(join(root, "dist", "aegis-totem-vscode-0.1.0.vsix"), "VS Code VSIX");
requireFile(releaseNotesPath, "release notes");

const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
if (!changelog.includes("## 0.1.0-alpha.1 - Unreleased")) {
  fail("CHANGELOG.md missing 0.1.0-alpha.1 unreleased heading");
}

const releaseNotes = readFileSync(releaseNotesPath, "utf8");
for (const expected of [
  "AEGIS Totem v0.1.0-alpha.1",
  "npm publish",
  "GitHub Release",
  "VS Code"
]) {
  if (!releaseNotes.includes(expected)) fail(`release notes missing ${expected}`);
}

console.log(`Release preflight passed for ${packageJson.name}@${packageJson.version} (${releaseTag}).`);
