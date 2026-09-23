import { appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ensureInsideRoot } from "../fs/repo.js";
import { sanitizeLaneName } from "./schema.js";
import { folderTotemTemplate } from "./templates.js";

export async function createFolderTotem(rootDir: string, folderPath: string): Promise<string> {
  const targetFolder = ensureInsideRoot(rootDir, join(rootDir, folderPath));
  const totemPath = join(targetFolder, "TOTEM.md");
  await writeFile(totemPath, folderTotemTemplate(folderPath.replace(/\\/g, "/"), new Date().toISOString()), { flag: "wx" });
  return totemPath;
}

export async function appendFolderTotem(rootDir: string, folderPath: string, actor: string, kind: string, body: string): Promise<string> {
  const targetFolder = ensureInsideRoot(rootDir, join(rootDir, folderPath));
  const totemPath = join(targetFolder, "TOTEM.md");
  const safeKind = kind.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  if (!safeKind) throw new Error("Append kind is required");
  await appendFile(totemPath, `\n### ${new Date().toISOString()} | ${sanitizeLaneName(actor)} | ${safeKind}\n\n${body.trim()}\n`, "utf8");
  return totemPath;
}
