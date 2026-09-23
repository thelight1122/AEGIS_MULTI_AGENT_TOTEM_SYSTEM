import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";

describe("initTotemRepo", () => {
  it("creates the Root Totem, config, and templates", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toContain("AEGIS Root Totem");
    await expect(readFile(join(root, ".aegis", "config.json"), "utf8")).resolves.toContain('"version": 1');
    await expect(readFile(join(root, ".aegis", "templates", "folder-totem.md"), "utf8")).resolves.toContain("Folder Totem");
  });
  it("does not overwrite an existing Root Totem", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "ROOT_TOTEM.md"), "User-authored Root Totem\n");
    await initTotemRepo(root);
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe("User-authored Root Totem\n");
  });
});
