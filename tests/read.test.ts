import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { initTotemRepo } from "../src/core/init.js";
import { createLane } from "../src/core/lanes.js";
import { readFolderTotem, readLane, readRootTotem } from "../src/core/read.js";
import { createFolderTotem } from "../src/core/totems.js";
import { createTempRepo } from "./helpers/tempRepo.js";

describe("read", () => {
  it("reads canonical Totem surfaces without editing files", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await createLane(root, "Codex");
    await mkdir(join(root, "src"), { recursive: true });
    await createFolderTotem(root, "src");
    const before = await readFile(join(root, "ROOT_TOTEM.md"), "utf8");

    await expect(readRootTotem(root)).resolves.toContain("# AEGIS Root Totem");
    await expect(readLane(root, "Codex")).resolves.toContain("# AEGIS Agent Lane: codex");
    await expect(readFolderTotem(root, "src")).resolves.toContain("# Folder Totem: src");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe(before);
  });

  it("rejects Folder Totem reads outside the repository", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);

    await expect(readFolderTotem(root, "../outside")).rejects.toThrow("outside repo root");
  });
});
