import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { TotemConfigSchema } from "./schema.js";
import { rootTotemTemplate } from "./templates.js";

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
  await writeFile(join(aegisDir, "templates", "folder-totem.md"), "# Folder Totem\n\n## Append Log\n", { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
  await writeFile(join(aegisDir, "templates", "agent-lane.md"), "# AEGIS Agent Lane\n\n## Append Log\n", { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });
}
