import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { createLane, appendLaneMessage } from "../src/core/lanes.js";
import { appendFolderTotem, createFolderTotem } from "../src/core/totems.js";
import { validateRepo } from "../src/core/validate.js";

describe("validateRepo", () => {
  it("passes an initialized repository", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await expect(validateRepo(root)).resolves.toEqual({ ok: true, errors: [] });
  });
  it("flags a Folder Totem without an append log", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "TOTEM.md"), "# Bad Totem\n");
    const result = await validateRepo(root);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing Append Log");
  });

  it("flags a tampered chained lane entry", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const lane = await createLane(root, "codex");
    await appendLaneMessage(root, "codex", "Original message.");
    const original = await readFile(lane, "utf8");
    await writeFile(lane, original.replace("Original message.", "Tampered message."));
    const result = await validateRepo(root);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("hash mismatch");
  });

  it("passes lanes and Folder Totems with multiple honest chained entries", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src"), { recursive: true });
    await createLane(root, "codex");
    await createFolderTotem(root, "src");

    await appendLaneMessage(root, "codex", "First lane message.");
    await appendLaneMessage(root, "codex", "Second lane message.");
    await appendLaneMessage(root, "codex", "Third lane message.");
    await appendFolderTotem(root, "src", "codex", "note", "First folder note.");
    await appendFolderTotem(root, "src", "codex", "note", "Second folder note.");

    await expect(validateRepo(root)).resolves.toEqual({ ok: true, errors: [] });
  });

  it("flags unchained entries after a chain has started", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const lane = await createLane(root, "codex");
    await appendLaneMessage(root, "codex", "First lane message.");
    await appendFile(lane, "\n### 2026-01-01T00:00:00.000Z | claude | note\nforged legacy entry\n", "utf8");

    const result = await validateRepo(root);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing chain metadata after the chain started");
  });
});
