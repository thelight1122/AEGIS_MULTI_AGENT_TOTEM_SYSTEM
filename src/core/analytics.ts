import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStatus } from "./status.js";

export type TotemAnalytics = {
  root: string;
  rootAppendEntries: number;
  laneCount: number;
  laneMessageEntries: number;
  folderTotemCount: number;
  folderAppendEntries: number;
  busiestLane?: { lane: string; entries: number };
  busiestFolderTotem?: { folderTotem: string; entries: number };
};

const appendHeading = /^###\s+/gm;

async function countHeadings(path: string): Promise<number> {
  try {
    return (await readFile(path, "utf8")).match(appendHeading)?.length ?? 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }
}

function topEntry<T extends { entries: number }>(entries: T[]): T | undefined {
  return entries.sort((a, b) => b.entries - a.entries)[0];
}

export async function getAnalytics(rootDir: string): Promise<TotemAnalytics> {
  const status = await getStatus(rootDir);
  const laneStats = await Promise.all(status.lanes.map(async (lane) => ({
    lane,
    entries: await countHeadings(join(rootDir, ".aegis", "lanes", lane))
  })));
  const folderStats = await Promise.all(status.folderTotems.map(async (folderTotem) => ({
    folderTotem,
    entries: await countHeadings(join(rootDir, folderTotem))
  })));

  return {
    root: rootDir,
    rootAppendEntries: await countHeadings(join(rootDir, "ROOT_TOTEM.md")),
    laneCount: status.lanes.length,
    laneMessageEntries: laneStats.reduce((sum, item) => sum + item.entries, 0),
    folderTotemCount: status.folderTotems.length,
    folderAppendEntries: folderStats.reduce((sum, item) => sum + item.entries, 0),
    busiestLane: topEntry(laneStats),
    busiestFolderTotem: topEntry(folderStats)
  };
}

export function formatAnalytics(analytics: TotemAnalytics): string {
  return [
    `AEGIS Totem analytics for ${analytics.root}`,
    `Root append entries: ${analytics.rootAppendEntries}`,
    `Agent lanes: ${analytics.laneCount}`,
    `Lane message entries: ${analytics.laneMessageEntries}`,
    `Folder Totems: ${analytics.folderTotemCount}`,
    `Folder append entries: ${analytics.folderAppendEntries}`,
    `Busiest lane: ${analytics.busiestLane ? `${analytics.busiestLane.lane} (${analytics.busiestLane.entries})` : "none"}`,
    `Busiest Folder Totem: ${analytics.busiestFolderTotem ? `${analytics.busiestFolderTotem.folderTotem} (${analytics.busiestFolderTotem.entries})` : "none"}`
  ].join("\n");
}
