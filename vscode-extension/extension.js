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
function findFiles(root, filename, relative = "") {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist" || entry.name === ".aegis") return [];
    const child = path.join(relative, entry.name);
    return entry.isDirectory() ? findFiles(root, filename, child) : entry.name === filename ? [child] : [];
  });
}
class TotemProvider {
  constructor() { this.emitter = new vscode.EventEmitter(); this.onDidChangeTreeData = this.emitter.event; }
  refresh() { this.emitter.fire(); }
  getTreeItem(item) { return item; }
  getChildren() {
    const root = repoRoot();
    if (!root) return Promise.resolve([]);
    const paths = ["ROOT_TOTEM.md", ...findFiles(root, "TOTEM.md"), ...findFiles(root, ".md", ".aegis/lanes")];
    return Promise.resolve(paths.filter((value, index, all) => all.indexOf(value) === index).filter((value) => fs.existsSync(path.join(root, value))).map((relativePath) => {
      const item = new vscode.TreeItem(relativePath === "ROOT_TOTEM.md" ? "Root Totem" : relativePath, vscode.TreeItemCollapsibleState.None);
      item.resourceUri = vscode.Uri.file(path.join(root, relativePath));
      item.command = { command: "vscode.open", title: "Open", arguments: [item.resourceUri] };
      return item;
    }));
  }
}
async function showError(action) { try { await action(); } catch (error) { vscode.window.showErrorMessage(`AEGIS: ${error.message}`); } }
function activate(context) {
  const provider = new TotemProvider();
  context.subscriptions.push(vscode.window.registerTreeDataProvider("aegisTotemView", provider));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.refresh", () => provider.refresh()));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.openRoot", () => vscode.commands.executeCommand("vscode.open", vscode.Uri.file(path.join(repoRoot(), "ROOT_TOTEM.md")))));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.status", () => showError(async () => vscode.window.showInformationMessage(await run("aegis-totem", ["status"])) )));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.validate", () => showError(async () => vscode.window.showInformationMessage(await run("aegis-totem", ["validate"])) )));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.sendMessage", () => showError(async () => {
    const lane = await vscode.window.showInputBox({ prompt: "Lane name" });
    const message = lane && await vscode.window.showInputBox({ prompt: "Message to append" });
    if (!lane || !message) return;
    const to = await vscode.window.showInputBox({ prompt: "Recipient lane (optional)" });
    await run("aegis-totem", ["lane", "message", lane, "--message", message, ...(to ? ["--to", to] : [])]);
    provider.refresh();
  })));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.appendFolderUpdate", () => showError(async () => {
    const folder = await vscode.window.showInputBox({ prompt: "Folder path relative to the repository" });
    const actor = await vscode.window.showInputBox({ prompt: "Actor lane" });
    const kind = await vscode.window.showInputBox({ prompt: "Update kind" });
    const message = await vscode.window.showInputBox({ prompt: "Update to append" });
    if (!folder || !actor || !kind || !message) return;
    await run("aegis-totem", ["totem", "append", folder, "--actor", actor, "--kind", kind, "--message", message]);
    provider.refresh();
  })));
}
module.exports = { activate };
