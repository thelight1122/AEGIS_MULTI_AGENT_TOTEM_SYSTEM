import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { TotemConfigSchema } from "./schema.js";
import { agentInstructionsTemplate, folderTotemTemplate, rootTotemTemplate } from "./templates.js";

const ignoredSeedDirectories = new Set([
  ".aegis",
  ".git",
  ".hg",
  ".next",
  ".svn",
  ".vscode",
  ".venv",
  ".tox",
  "__pycache__",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "tmp",
  "venv"
]);

export async function initTotemRepo(rootDir: string): Promise<void> {
  const aegisDir = join(rootDir, ".aegis");
  await mkdir(join(aegisDir, "lanes"), { recursive: true });
  await mkdir(join(aegisDir, "templates"), { recursive: true });
  await writeFile(join(aegisDir, "config.json"), `${JSON.stringify(TotemConfigSchema.parse({ version: 1 }), null, 2)}\n`, { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
  await writeFile(join(rootDir, "ROOT_TOTEM.md"), rootTotemTemplate(new Date().toISOString()), { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
  await writeFile(join(rootDir, "AGENTS.md"), agentInstructionsTemplate, { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
  await writeFile(join(aegisDir, "templates", "folder-totem.md"), "# Folder Totem\n\n## Append Log\n", { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
  await writeFile(join(aegisDir, "templates", "agent-lane.md"), "# AEGIS Agent Lane\n\n## Append Log\n", { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
}

async function seedFolderTotems(rootDir: string, currentDir = rootDir): Promise<number> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const branchEntries = entries.filter((entry) => entry.isDirectory() && !ignoredSeedDirectories.has(entry.name));
  let created = 0;

  if (currentDir !== rootDir && branchEntries.length > 0) {
    const relativeFolder = relative(rootDir, currentDir).replace(/\\/g, "/");
    await writeFile(
      join(currentDir, "TOTEM.md"),
      folderTotemTemplate(relativeFolder, new Date().toISOString(), branchEntries.map((entry) => entry.name).sort()),
      { flag: "wx" }
    )
      .then(() => { created += 1; })
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "EEXIST") throw error;
      });
  }

  for (const entry of branchEntries) {
    const folder = join(currentDir, entry.name);
    created += await seedFolderTotems(rootDir, folder);
  }

  return created;
}

export type StartTotemRepoResult = {
  seededFolderTotems: number;
};

export async function startTotemRepo(rootDir: string): Promise<StartTotemRepoResult> {
  await initTotemRepo(rootDir);
  return { seededFolderTotems: await seedFolderTotems(rootDir) };
}
