import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStatus } from "./status.js";

export type ValidationResult = { ok: boolean; errors: string[] };

export async function validateRepo(rootDir: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const status = await getStatus(rootDir);
  if (!status.rootTotem) errors.push("ROOT_TOTEM.md is missing");
  for (const path of status.folderTotems) {
    if (!(await readFile(join(rootDir, path), "utf8")).includes("## Append Log")) errors.push(`${path} is missing Append Log`);
  }
  for (const lane of status.lanes) {
    if (!(await readFile(join(rootDir, ".aegis", "lanes", lane), "utf8")).includes("## Append Log")) errors.push(`lane ${lane} is missing Append Log`);
  }
  return { ok: errors.length === 0, errors };
}

export function formatValidation(result: ValidationResult): string {
  return result.ok ? "AEGIS Totem validation passed." : ["AEGIS Totem validation failed:", ...result.errors.map((error) => `- ${error}`)].join("\n");
}
