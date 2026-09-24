import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export type TotemStatus = { root: string; rootTotem: boolean; lanes: string[]; folderTotems: string[] };
export type InventoryScope = "all" | "lanes" | "folders";

const ignoredWalkDirectories = new Set([".aegis", ".git", ".hg", ".next", ".svn", ".tox", ".venv", ".vscode", "__pycache__", "build", "coverage", "dist", "node_modules", "out", "target", "tmp", "venv"]);

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredWalkDirectories.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

export async function getStatus(rootDir: string): Promise<TotemStatus> {
  const lanesPrefix = join(rootDir, ".aegis", "lanes");
  const files = [
    ...await walk(rootDir),
    ...await walk(lanesPrefix).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    })
  ];
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

export function formatInventory(status: TotemStatus, scope: InventoryScope = "all"): string {
  if (scope === "lanes") {
    return [
      `AEGIS Totem lanes for ${status.root}`,
      ...formatItems(status.lanes)
    ].join("\n");
  }

  if (scope === "folders") {
    return [
      `AEGIS Folder Totems for ${status.root}`,
      ...formatItems(status.folderTotems)
    ].join("\n");
  }

  return [
    `AEGIS Totem inventory for ${status.root}`,
    `Root Totem: ${status.rootTotem ? "ROOT_TOTEM.md" : "missing"}`,
    "",
    "Agent lanes:",
    ...formatItems(status.lanes),
    "",
    "Folder Totems:",
    ...formatItems(status.folderTotems)
  ].join("\n");
}

function formatItems(items: string[]): string[] {
  return items.length ? items.map((item) => `- ${item}`) : ["- none"];
}

export function resolveInventoryScope(options: { lanes?: boolean; folders?: boolean }): InventoryScope {
  if (options.lanes && options.folders) throw new Error("Use only one list filter: --lanes or --folders.");
  if (options.lanes) return "lanes";
  if (options.folders) return "folders";
  return "all";
}
