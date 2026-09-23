import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { createLane } from "../src/core/lanes.js";
import { createFolderTotem } from "../src/core/totems.js";
import { formatStatus, getStatus } from "../src/core/status.js";

describe("status", () => {
  it("reports Totems and lanes without editing the Root Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await createLane(root, "codex");
    await mkdir(join(root, "src"), { recursive: true });
    await createFolderTotem(root, "src");
    const before = await readFile(join(root, "ROOT_TOTEM.md"), "utf8");
    const status = await getStatus(root);
    expect(status.lanes).toContain("codex.md");
    expect(status.folderTotems).toContain("src/TOTEM.md");
    expect(formatStatus(status)).toContain("Agent lanes: 1");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe(before);
  });
});
