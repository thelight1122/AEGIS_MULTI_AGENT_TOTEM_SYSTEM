import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { appendChained } from "../fs/append.js";
import { ensureInsideRoot } from "../fs/repo.js";
import { sanitizeLaneName } from "./schema.js";
import { folderTotemTemplate } from "./templates.js";

const ignoredFolderElements = new Set([".aegis", ".git", ".hg", ".next", ".svn", ".tox", ".venv", ".vscode", "__pycache__", "build", "coverage", "dist", "node_modules", "out", "target", "tmp", "venv"]);

export async function createFolderTotem(rootDir: string, folderPath: string): Promise<string> {
  const targetFolder = ensureInsideRoot(rootDir, join(rootDir, folderPath));
  await mkdir(targetFolder, { recursive: true });
  const totemPath = join(targetFolder, "TOTEM.md");
  const entries = await readdir(targetFolder, { withFileTypes: true });
  const subfolders = entries
    .filter((entry) => entry.isDirectory() && !ignoredFolderElements.has(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  await writeFile(totemPath, folderTotemTemplate(folderPath.replace(/\\/g, "/"), new Date().toISOString(), subfolders), { flag: "wx" });
  return totemPath;
}

export async function appendFolderTotem(rootDir: string, folderPath: string, actor: string, kind: string, body: string): Promise<string> {
  const targetFolder = ensureInsideRoot(rootDir, join(rootDir, folderPath));
  const totemPath = join(targetFolder, "TOTEM.md");
  const safeKind = kind.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  if (!safeKind) throw new Error("Append kind is required");
  await appendChained(totemPath, `### ${new Date().toISOString()} | ${sanitizeLaneName(actor)} | ${safeKind}`, body);
  return totemPath;
}
