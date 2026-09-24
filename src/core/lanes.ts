import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { appendChained } from "../fs/append.js";
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
  const addressed = to ? `To: ${sanitizeLaneName(to)}\n\n` : "";
  await appendChained(lanePath, `### ${new Date().toISOString()} | ${safeName} | message`, `${addressed}${message}`);
  return lanePath;
}
