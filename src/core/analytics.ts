import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStatus } from "./status.js";

export type TotemAnalytics = {
  root: string;
  rootAppendEntries: number;
  rootLastActivity?: string;
  laneCount: number;
  laneMessageEntries: number;
  activeLaneCount: number;
  quietLaneCount: number;
  folderTotemCount: number;
  folderAppendEntries: number;
  activeFolderTotemCount: number;
  quietFolderTotemCount: number;
  lastActivity?: string;
  busiestLane?: { lane: string; entries: number };
  busiestFolderTotem?: { folderTotem: string; entries: number };
  lanes: ActivityStat[];
  folderTotems: ActivityStat[];
};

const appendHeading = /^###\s+/gm;
const timestampHeading = /^###\s+(\d{4}-\d{2}-\d{2}T[^\s|]+)/gm;

export type ActivityStat = {
  name: string;
  entries: number;
  lastActivity?: string;
};

async function readActivity(path: string, name: string): Promise<ActivityStat> {
  try {
    const content = await readFile(path, "utf8");
    const timestamps = [...content.matchAll(timestampHeading)]
      .map((match) => match[1])
      .filter((value): value is string => Boolean(value))
      .sort();

    return {
      name,
      entries: content.match(appendHeading)?.length ?? 0,
      lastActivity: timestamps.at(-1)
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { name, entries: 0 };
    throw error;
  }
}

function topEntry<T extends { entries: number; lastActivity?: string }>(entries: T[]): T | undefined {
  return [...entries].sort((a, b) => {
    if (b.entries !== a.entries) return b.entries - a.entries;
    return (b.lastActivity ?? "").localeCompare(a.lastActivity ?? "");
  })[0];
}

function latestActivity(entries: ActivityStat[]): string | undefined {
  return entries
    .map((entry) => entry.lastActivity)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
}

function countActive(entries: ActivityStat[]): number {
  return entries.filter((entry) => entry.entries > 0).length;
}

export async function getAnalytics(rootDir: string): Promise<TotemAnalytics> {
  const status = await getStatus(rootDir);
  const rootStats = await readActivity(join(rootDir, "ROOT_TOTEM.md"), "ROOT_TOTEM.md");
  const laneStats = await Promise.all(status.lanes.map(async (lane) =>
    readActivity(join(rootDir, ".aegis", "lanes", lane), lane)
  ));
  const folderStats = await Promise.all(status.folderTotems.map(async (folderTotem) =>
    readActivity(join(rootDir, folderTotem), folderTotem)
  ));
  const allStats = [rootStats, ...laneStats, ...folderStats];
  const activeLaneCount = countActive(laneStats);
  const activeFolderTotemCount = countActive(folderStats);

  const busiestLane = topEntry(laneStats);
  const busiestFolderTotem = topEntry(folderStats);

  return {
    root: rootDir,
    rootAppendEntries: rootStats.entries,
    rootLastActivity: rootStats.lastActivity,
    laneCount: status.lanes.length,
    laneMessageEntries: laneStats.reduce((sum, item) => sum + item.entries, 0),
    activeLaneCount,
    quietLaneCount: status.lanes.length - activeLaneCount,
    folderTotemCount: status.folderTotems.length,
    folderAppendEntries: folderStats.reduce((sum, item) => sum + item.entries, 0),
    activeFolderTotemCount,
    quietFolderTotemCount: status.folderTotems.length - activeFolderTotemCount,
    lastActivity: latestActivity(allStats),
    busiestLane: busiestLane?.entries ? {
      lane: busiestLane.name,
      entries: busiestLane.entries
    } : undefined,
    busiestFolderTotem: busiestFolderTotem?.entries ? {
      folderTotem: busiestFolderTotem.name,
      entries: busiestFolderTotem.entries
    } : undefined,
    lanes: laneStats,
    folderTotems: folderStats
  };
}

export function formatAnalytics(analytics: TotemAnalytics): string {
  return [
    `AEGIS Totem analytics for ${analytics.root}`,
    `Root append entries: ${analytics.rootAppendEntries}`,
    `Last activity: ${analytics.lastActivity ?? "none"}`,
    `Agent lanes: ${analytics.laneCount}`,
    `Lane message entries: ${analytics.laneMessageEntries}`,
    `Active lanes: ${analytics.activeLaneCount}`,
    `Quiet lanes: ${analytics.quietLaneCount}`,
    `Folder Totems: ${analytics.folderTotemCount}`,
    `Folder append entries: ${analytics.folderAppendEntries}`,
    `Active Folder Totems: ${analytics.activeFolderTotemCount}`,
    `Quiet Folder Totems: ${analytics.quietFolderTotemCount}`,
    `Busiest lane: ${analytics.busiestLane ? `${analytics.busiestLane.lane} (${analytics.busiestLane.entries})` : "none"}`,
    `Busiest Folder Totem: ${analytics.busiestFolderTotem ? `${analytics.busiestFolderTotem.folderTotem} (${analytics.busiestFolderTotem.entries})` : "none"}`
  ].join("\n");
}
