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
class TotemProvider {
  constructor() { this.emitter = new vscode.EventEmitter(); this.onDidChangeTreeData = this.emitter.event; }
  refresh() { this.emitter.fire(); }
  getTreeItem(item) { return item; }
  getChildren() {
    const root = repoRoot();
    if (!root) return Promise.resolve([]);
    const items = [];
    for (const [label, relativePath] of [["Root Totem", "ROOT_TOTEM.md"], ["Source Totem", "src/TOTEM.md"], ["Tests Totem", "tests/TOTEM.md"], ["Codex Lane", ".aegis/lanes/codex.md"]]) {
      const full = path.join(root, relativePath);
      if (!fs.existsSync(full)) continue;
      const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
      item.resourceUri = vscode.Uri.file(full);
      item.command = { command: "vscode.open", title: "Open", arguments: [item.resourceUri] };
      items.push(item);
    }
    return Promise.resolve(items);
  }
}
function activate(context) {
  const provider = new TotemProvider();
  context.subscriptions.push(vscode.window.registerTreeDataProvider("aegisTotemView", provider));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.refresh", () => provider.refresh()));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.openRoot", () => vscode.commands.executeCommand("vscode.open", vscode.Uri.file(path.join(repoRoot(), "ROOT_TOTEM.md")))));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.status", async () => vscode.window.showInformationMessage(await run("aegis-totem", ["status"]))));
  context.subscriptions.push(vscode.commands.registerCommand("aegisTotem.validate", async () => vscode.window.showInformationMessage(await run("aegis-totem", ["validate"]))));
}
module.exports = { activate };
