const vscode = require("vscode");
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

function repoRoot() { return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; }
function run(command, args) {
  const root = repoRoot();
  return new Promise((resolve, reject) => {
    if (!root) return reject(new Error("Open a repository folder first."));
    cp.execFile(command, args, { cwd: root }, (error, stdout, stderr) => error ? reject(new Error(stderr || error.message)) : resolve(stdout.trim()));
  });
}
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function statRows(items) {
  if (!items?.length) return "<tr><td colspan=\"3\">None</td></tr>";
  return items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.entries}</td><td>${escapeHtml(item.lastActivity ?? "none")}</td></tr>`).join("");
}
function analyticsHtml(analytics) {
  const totalEntries = analytics.rootAppendEntries + analytics.laneMessageEntries + analytics.folderAppendEntries;
  const cards = [
    ["Total entries", totalEntries],
    ["Last activity", analytics.lastActivity ?? "none"],
    ["Active lanes", `${analytics.activeLaneCount}/${analytics.laneCount}`],
    ["Quiet lanes", analytics.quietLaneCount],
    ["Active Folder Totems", `${analytics.activeFolderTotemCount}/${analytics.folderTotemCount}`],
    ["Quiet Folder Totems", analytics.quietFolderTotemCount],
    ["Busiest lane", analytics.busiestLane ? `${analytics.busiestLane.lane} (${analytics.busiestLane.entries})` : "none"],
    ["Busiest Folder Totem", analytics.busiestFolderTotem ? `${analytics.busiestFolderTotem.folderTotem} (${analytics.busiestFolderTotem.entries})` : "none"]
  ];
  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { color: var(--vscode-foreground); font-family: var(--vscode-font-family); padding: 20px; }
    h1, h2 { font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 16px 0 24px; }
    .card { border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 10px; background: var(--vscode-editor-background); }
    .label { color: var(--vscode-descriptionForeground); font-size: 12px; margin-bottom: 6px; }
    .value { font-size: 16px; font-weight: 600; overflow-wrap: anywhere; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
    th, td { border-bottom: 1px solid var(--vscode-panel-border); padding: 7px 6px; text-align: left; vertical-align: top; }
    th { color: var(--vscode-descriptionForeground); font-weight: 600; }
  </style>
</head>
<body>
  <h1>AEGIS Totem Analytics</h1>
  <p>${escapeHtml(analytics.root)}</p>
  <div class="grid">${cards.map(([label, value]) => `<div class="card"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div></div>`).join("")}</div>
  <h2>Agent Lanes</h2>
  <table><thead><tr><th>Lane</th><th>Entries</th><th>Last Activity</th></tr></thead><tbody>${statRows(analytics.lanes)}</tbody></table>
  <h2>Folder Totems</h2>
  <table><thead><tr><th>Folder Totem</th><th>Entries</th><th>Last Activity</th></tr></thead><tbody>${statRows(analytics.folderTotems)}</tbody></table>
</body>
</html>`;
}
function findFiles(root, filename, relative = "", options = {}) {
  const skipAegis = options.skipAegis !== false;
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist" || (skipAegis && entry.name === ".aegis")) return [];
    const child = path.join(relative, entry.name);
    return entry.isDirectory() ? findFiles(root, filename, child, options) : entry.name === filename ? [child] : [];
  });
}
function openFileItem(root, label, relativePath) {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.resourceUri = vscode.Uri.file(path.join(root, relativePath));
  item.description = relativePath;
  item.command = { command: "vscode.open", title: "Open", arguments: [item.resourceUri] };
  return item;
}
function groupItem(label, contextValue) {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
  item.contextValue = contextValue;
  return item;
}
class TotemProvider {
  constructor() { this.emitter = new vscode.EventEmitter(); this.onDidChangeTreeData = this.emitter.event; }
  refresh() { this.emitter.fire(); }
  getTreeItem(item) { return item; }
  getChildren(item) {
    const root = repoRoot();
    if (!root) return Promise.resolve([]);
    if (!item) {
      return Promise.resolve([
        groupItem("Root", "aegisRootGroup"),
        groupItem("Folder Totems", "aegisFolderTotemsGroup"),
        groupItem("Agent Lanes", "aegisLanesGroup")
      ]);
    }
    if (item.contextValue === "aegisRootGroup") {
      return Promise.resolve(fs.existsSync(path.join(root, "ROOT_TOTEM.md")) ? [openFileItem(root, "Root Totem", "ROOT_TOTEM.md")] : []);
    }
    if (item.contextValue === "aegisFolderTotemsGroup") {
      const paths = findFiles(root, "TOTEM.md").filter((value, index, all) => all.indexOf(value) === index);
      return Promise.resolve(paths.map((relativePath) => openFileItem(root, path.dirname(relativePath), relativePath)));
    }
    if (item.contextValue === "aegisLanesGroup") {
      const paths = findFiles(root, ".md", ".aegis/lanes", { skipAegis: false }).filter((value, index, all) => all.indexOf(value) === index);
      return Promise.resolve(paths.map((relativePath) => openFileItem(root, path.basename(relativePath, ".md"), relativePath)));
    }
    return Promise.resolve([]);
  }
}
async function showError(action) { try { await action(); } catch (error) { vscode.window.showErrorMessage(`AEGIS: ${error.message}`); } }
function activate(context) {
  const provider = new TotemProvider();
  context.subscriptions.push(vscode.window.registerTreeDataProvider("aegisTotemView", provider));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.refresh", () => provider.refresh()));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.openRoot", () => showError(async () => {
    const root = repoRoot();
    if (!root) throw new Error("Open a repository folder first.");
    const rootTotem = path.join(root, "ROOT_TOTEM.md");
    if (!fs.existsSync(rootTotem)) throw new Error("ROOT_TOTEM.md was not found. Run AEGIS: Initialize from the CLI first.");
    await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(rootTotem));
  })));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.status", () => showError(async () => vscode.window.showInformationMessage(await run("aegis-totem", ["status"])) )));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.analytics", () => showError(async () => {
    const analytics = JSON.parse(await run("aegis-totem", ["analytics", "--json"]));
    const panel = vscode.window.createWebviewPanel("aegisTotemAnalytics", "AEGIS Totem Analytics", vscode.ViewColumn.Beside, {});
    panel.webview.html = analyticsHtml(analytics);
  })));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.validate", () => showError(async () => vscode.window.showInformationMessage(await run("aegis-totem", ["validate"])) )));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.sendMessage", () => showError(async () => {
    const lane = await vscode.window.showInputBox({ prompt: "Lane name", placeHolder: "codex" });
    const message = lane && await vscode.window.showInputBox({ prompt: "Message to append", placeHolder: "I am working in src/core. I will append when verification passes." });
    if (!lane || !message) return;
    const to = await vscode.window.showInputBox({ prompt: "Recipient lane (optional)", placeHolder: "claude" });
    await run("aegis-totem", ["lane", "message", lane, "--message", message, ...(to ? ["--to", to] : [])]);
    provider.refresh();
    vscode.window.showInformationMessage(`AEGIS: Appended message to ${lane}.`);
  })));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.appendFolderUpdate", () => showError(async () => {
    const folder = await vscode.window.showInputBox({ prompt: "Folder path relative to the repository", placeHolder: "src" });
    const actor = await vscode.window.showInputBox({ prompt: "Actor lane", placeHolder: "codex" });
    const kind = await vscode.window.showInputBox({ prompt: "Update kind", placeHolder: "verified-change" });
    const message = await vscode.window.showInputBox({ prompt: "Update to append", placeHolder: "Changed status output. Verification: npm test passed." });
    if (!folder || !actor || !kind || !message) return;
    await run("aegis-totem", ["totem", "append", folder, "--actor", actor, "--kind", kind, "--message", message]);
    provider.refresh();
    vscode.window.showInformationMessage(`AEGIS: Appended Folder Totem update for ${folder}.`);
  })));
}
module.exports = { activate };
