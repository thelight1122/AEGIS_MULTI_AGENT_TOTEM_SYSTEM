import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { sanitizeLaneName } from "./schema.js";
import { laneTemplate } from "./templates.js";

export async function createLane(rootDir: string, laneName: string): Promise<string> {
  const safeName = sanitizeLaneName(laneName);
  const lanesDir = join(rootDir, ".aegis", "lanes");
  await mkdir(lanesDir, { recursive: true });
  const lanePath = join(lanesDir, `${safeName}.md`);
  await writeFile(lanePath, laneTemplate(safeName, new Date().toISOString()), { flag: "wx" });
  return lanePath;
}

export async function appendLaneMessage(rootDir: string, laneName: string, message: string, to?: string): Promise<string> {
  const safeName = sanitizeLaneName(laneName);
  const lanePath = join(rootDir, ".aegis", "lanes", `${safeName}.md`);
  const addressed = to ? `\nTo: ${sanitizeLaneName(to)}\n` : "";
  await appendFile(lanePath, `\n### ${new Date().toISOString()} | ${safeName} | message${addressed}\n${message.trim()}\n`, "utf8");
  return lanePath;
}
