import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getAnalytics, formatAnalytics } from "../src/core/analytics.js";
import { initTotemRepo } from "../src/core/init.js";
import { appendLaneMessage, createLane } from "../src/core/lanes.js";
import { appendFolderTotem, createFolderTotem } from "../src/core/totems.js";
import { createTempRepo } from "./helpers/tempRepo.js";

describe("analytics", () => {
  it("reports append activity without editing durable files", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await createLane(root, "codex");
    await createLane(root, "claude");
    await appendLaneMessage(root, "codex", "Working in src.", "claude");
    await appendLaneMessage(root, "codex", "Verification passed.");
    await mkdir(join(root, "src"), { recursive: true });
    await createFolderTotem(root, "src");
    await appendFolderTotem(root, "src", "codex", "verified-change", "Added analytics.");

    const rootBefore = await readFile(join(root, "ROOT_TOTEM.md"), "utf8");
    const analytics = await getAnalytics(root);

    expect(analytics.rootAppendEntries).toBe(0);
    expect(analytics.laneCount).toBe(2);
    expect(analytics.laneMessageEntries).toBe(2);
    expect(analytics.folderTotemCount).toBe(1);
    expect(analytics.folderAppendEntries).toBe(1);
    expect(analytics.busiestLane).toEqual({ lane: "codex.md", entries: 2 });
    expect(formatAnalytics(analytics)).toContain("Busiest lane: codex.md (2)");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe(rootBefore);
  });
});
