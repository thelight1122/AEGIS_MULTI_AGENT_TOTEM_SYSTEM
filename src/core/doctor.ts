import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAnalytics } from "./analytics.js";
import { getStatus } from "./status.js";
import { validateRepo } from "./validate.js";

export type DoctorCheck = {
  ok: boolean;
  label: string;
  detail: string;
};

export type DoctorResult = {
  ok: boolean;
  checks: DoctorCheck[];
};

async function hasAegisHook(rootDir: string): Promise<boolean> {
  try {
    return (await readFile(join(rootDir, ".git", "hooks", "pre-commit"), "utf8")).includes("aegis-totem validate");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function runDoctor(rootDir: string): Promise<DoctorResult> {
  const status = await getStatus(rootDir);
  const validation = await validateRepo(rootDir);
  const analytics = await getAnalytics(rootDir);
  const hookInstalled = await hasAegisHook(rootDir);
  const checks: DoctorCheck[] = [
    {
      ok: status.rootTotem,
      label: "Root Totem",
      detail: status.rootTotem ? "ROOT_TOTEM.md is present." : "Run `aegis-totem init`."
    },
    {
      ok: validation.ok,
      label: "Structure",
      detail: validation.ok ? "Required append-log structure is valid." : validation.errors.join("; ")
    },
    {
      ok: status.lanes.length > 0,
      label: "Agent lanes",
      detail: status.lanes.length > 0 ? `${status.lanes.length} lane(s) found.` : "Create one lane per agent with `aegis-totem lane create <name>`."
    },
    {
      ok: status.folderTotems.length > 0,
      label: "Folder Totems",
      detail: status.folderTotems.length > 0 ? `${status.folderTotems.length} Folder Totem(s) found.` : "Create Folder Totems for active work areas with `aegis-totem totem create <folder>`."
    },
    {
      ok: analytics.laneMessageEntries > 0 || analytics.folderAppendEntries > 0,
      label: "Append activity",
      detail: analytics.laneMessageEntries > 0 || analytics.folderAppendEntries > 0
        ? `${analytics.laneMessageEntries} lane message(s), ${analytics.folderAppendEntries} Folder Totem append(s).`
        : "No lane or Folder Totem appends yet. Add coordination messages before parallel work begins."
    },
    {
      ok: hookInstalled,
      label: "Local validation hook",
      detail: hookInstalled ? "Pre-commit validation hook is installed." : "Optional: run `aegis-totem hooks install`."
    }
  ];

  return { ok: checks.every((check) => check.ok), checks };
}

export function formatDoctor(result: DoctorResult): string {
  return [
    result.ok ? "AEGIS Totem doctor passed." : "AEGIS Totem doctor found readiness gaps:",
    ...result.checks.map((check) => `${check.ok ? "OK" : "WARN"} ${check.label}: ${check.detail}`)
  ].join("\n");
}
