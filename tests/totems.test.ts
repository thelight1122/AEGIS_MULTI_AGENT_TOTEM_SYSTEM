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
    expect(after).toContain("Chain-Prev: GENESIS");
    expect(after).toContain("Chain-Hash:");
  });

  it("refuses to append to a missing Folder Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "docs"), { recursive: true });
    await expect(appendFolderTotem(root, "docs", "codex", "verified-change", "Should not create a headerless Totem.")).rejects.toThrow("ENOENT");
  });

  it("creates the target folder when creating a folder Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const path = await createFolderTotem(root, "src/new-feature");
    const body = await readFile(path, "utf8");
    expect(body).toContain("# Folder Totem: src/new-feature");
  });

  it("lists immediate subfolder elements when creating a folder Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src", "core"), { recursive: true });
    await mkdir(join(root, "src", "ui"), { recursive: true });
    await mkdir(join(root, "src", "node_modules", "ignored"), { recursive: true });
    const path = await createFolderTotem(root, "src");
    const body = await readFile(path, "utf8");
    expect(body).toContain("## Subfolder Elements");
    expect(body).toContain("- core");
    expect(body).toContain("- ui");
    expect(body).not.toContain("node_modules");
  });

  it("normalizes Windows-style folder paths in the Folder Totem title", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const path = await createFolderTotem(root, "src\\core");
    const body = await readFile(path, "utf8");
    expect(body).toContain("# Folder Totem: src/core");
  });
});
