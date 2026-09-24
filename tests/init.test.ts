import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo, startTotemRepo } from "../src/core/init.js";

describe("initTotemRepo", () => {
  it("creates the Root Totem, config, and templates", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toContain("AEGIS Root Totem");
    await expect(readFile(join(root, ".aegis", "config.json"), "utf8")).resolves.toContain('"version": 1');
    await expect(readFile(join(root, ".aegis", "templates", "folder-totem.md"), "utf8")).resolves.toContain("Folder Totem");
    const agentInstructions = await readFile(join(root, "AGENTS.md"), "utf8");
    expect(agentInstructions).toContain("Before Each Coding Turn");
    expect(agentInstructions).toContain("Read `ROOT_TOTEM.md`");
    expect(agentInstructions).toContain("After Each Coding Turn");
    expect(agentInstructions).toContain("Never rewrite or delete historical Totem or lane entries.");
  });
  it("does not overwrite existing agent instructions", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "AGENTS.md"), "Existing instructions\n");
    await initTotemRepo(root);
    await expect(readFile(join(root, "AGENTS.md"), "utf8")).resolves.toBe("Existing instructions\n");
  });
  it("does not overwrite an existing Root Totem", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "ROOT_TOTEM.md"), "User-authored Root Totem\n");
    await initTotemRepo(root);
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe("User-authored Root Totem\n");
  });
  it("starts an existing repo by seeding branch Folder Totems and listing subfolders", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, "src", "core", "parser"), { recursive: true });
    await mkdir(join(root, "src", "ui"), { recursive: true });
    await mkdir(join(root, "docs"), { recursive: true });
    await mkdir(join(root, "node_modules", "ignored-package"), { recursive: true });
    await mkdir(join(root, ".venv", "lib", "site"), { recursive: true });
    await mkdir(join(root, "build", "generated"), { recursive: true });
    await writeFile(join(root, "docs", "TOTEM.md"), "Existing docs Totem\n");

    const result = await startTotemRepo(root);

    expect(result.root).toBe(root.replace(/\\/g, "/"));
    expect(result.ready).toBe(true);
    expect(result.seededFolderTotems).toBe(2);
    const srcTotem = await readFile(join(root, "src", "TOTEM.md"), "utf8");
    expect(srcTotem).toContain("# Folder Totem: src");
    expect(srcTotem).toContain("## Subfolder Elements");
    expect(srcTotem).toContain("- core");
    expect(srcTotem).toContain("- ui");
    await expect(readFile(join(root, "src", "core", "TOTEM.md"), "utf8")).resolves.toContain("- parser");
    await expect(readFile(join(root, "src", "ui", "TOTEM.md"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(join(root, ".venv", "TOTEM.md"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(join(root, "build", "TOTEM.md"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(join(root, "docs", "TOTEM.md"), "utf8")).resolves.toBe("Existing docs Totem\n");
    await expect(readFile(join(root, "AGENTS.md"), "utf8")).resolves.toContain("AEGIS Totem Instructions");
  });
});
