import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = join(root, "dist");
const packagePath = join(outDir, "aegis-totem-vscode-0.1.0.vsix");
const vsceBin = join(root, "node_modules", "@vscode", "vsce", "vsce");

mkdirSync(outDir, { recursive: true });

const result = spawnSync(
  process.execPath,
  [vsceBin, "package", "--out", packagePath],
  {
    cwd: join(root, "vscode-extension"),
    stdio: "inherit",
    shell: false
  }
);

if (result.error) {
  console.error(result.error.message);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
