import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sanitizeLaneName } from "./schema.js";
import { ensureInsideRoot } from "../fs/repo.js";

export async function readRootTotem(rootDir: string): Promise<string> {
  return readFile(join(rootDir, "ROOT_TOTEM.md"), "utf8");
}

export async function readLane(rootDir: string, laneName: string): Promise<string> {
  return readFile(join(rootDir, ".aegis", "lanes", `${sanitizeLaneName(laneName)}.md`), "utf8");
}

export async function readFolderTotem(rootDir: string, folderPath: string): Promise<string> {
  return readFile(join(ensureInsideRoot(rootDir, join(rootDir, folderPath)), "TOTEM.md"), "utf8");
}
