import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = join(root, "dist");
const packagePath = join(outDir, "aegis-totem-vscode-0.1.1.vsix");
const vsceBin = join(root, "node_modules", "@vscode", "vsce", "vsce");
const extensionDir = join(root, "vscode-extension");
const bundledCliDir = join(extensionDir, "cli-dist");

mkdirSync(outDir, { recursive: true });
rmSync(bundledCliDir, { recursive: true, force: true });
cpSync(join(root, "dist", "src"), join(bundledCliDir, "src"), { recursive: true });
writeFileSync(join(bundledCliDir, "package.json"), JSON.stringify({ type: "module" }, null, 2));
mkdirSync(join(bundledCliDir, "node_modules"), { recursive: true });
for (const dependency of ["commander", "zod"]) {
  cpSync(join(root, "node_modules", dependency), join(bundledCliDir, "node_modules", dependency), { recursive: true });
}

const result = spawnSync(
  process.execPath,
  [vsceBin, "package", "--out", packagePath],
  {
    cwd: extensionDir,
    stdio: "inherit",
    shell: false
  }
);

rmSync(bundledCliDir, { recursive: true, force: true });

if (result.error) {
  console.error(result.error.message);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
