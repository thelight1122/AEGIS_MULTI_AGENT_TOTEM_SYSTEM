import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export type TotemStatus = { root: string; rootTotem: boolean; lanes: string[]; folderTotems: string[] };

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

export async function getStatus(rootDir: string): Promise<TotemStatus> {
  const files = await walk(rootDir);
  const lanesPrefix = join(rootDir, ".aegis", "lanes");
  return {
    root: rootDir,
    rootTotem: files.includes(join(rootDir, "ROOT_TOTEM.md")),
    lanes: files.filter((file) => file.startsWith(lanesPrefix) && file.endsWith(".md")).map((file) => relative(lanesPrefix, file).replace(/\\/g, "/")),
    folderTotems: files.filter((file) => file.endsWith("TOTEM.md") && !file.endsWith("ROOT_TOTEM.md")).map((file) => relative(rootDir, file).replace(/\\/g, "/"))
  };
}

export function formatStatus(status: TotemStatus): string {
  return [
    `AEGIS Totem status for ${status.root}`,
    `Root Totem: ${status.rootTotem ? "present" : "missing"}`,
    `Folder Totems: ${status.folderTotems.length}`,
    `Agent lanes: ${status.lanes.length}`
  ].join("\n");
}
