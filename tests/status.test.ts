import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { createLane } from "../src/core/lanes.js";
import { createFolderTotem } from "../src/core/totems.js";
import { formatInventory, formatStatus, getStatus, resolveInventoryScope } from "../src/core/status.js";

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
    expect(formatInventory(status)).toContain("- codex.md");
    expect(formatInventory(status)).toContain("- src/TOTEM.md");
    expect(formatInventory(status, "lanes")).toContain("AEGIS Totem lanes");
    expect(formatInventory(status, "lanes")).not.toContain("src/TOTEM.md");
    expect(formatInventory(status, "folders")).toContain("AEGIS Folder Totems");
    expect(formatInventory(status, "folders")).not.toContain("codex.md");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe(before);
  });

  it("rejects conflicting inventory filters", () => {
    expect(() => resolveInventoryScope({ lanes: true, folders: true })).toThrow("Use only one list filter");
  });
});
