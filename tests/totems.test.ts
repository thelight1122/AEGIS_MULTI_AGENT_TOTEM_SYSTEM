import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { appendFolderTotem, createFolderTotem } from "../src/core/totems.js";

describe("folder Totems", () => {
  it("creates and appends a folder Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src", "api"), { recursive: true });
    const path = await createFolderTotem(root, "src/api");
    const before = await readFile(path, "utf8");
    await appendFolderTotem(root, "src/api", "codex", "verified-change", "Added parser tests.");
    const after = await readFile(path, "utf8");
    expect(after.startsWith(before)).toBe(true);
    expect(after).toContain("codex | verified-change");
  });

  it("creates the target folder when creating a folder Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const path = await createFolderTotem(root, "src/new-feature");
    const body = await readFile(path, "utf8");
    expect(body).toContain("# Folder Totem: src/new-feature");
  });
});
