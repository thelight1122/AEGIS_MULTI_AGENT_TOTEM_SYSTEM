import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { ensureInsideRoot, findRepoRoot } from "../src/fs/repo.js";

describe("repo helpers", () => {
  it("finds a Totem repo from a nested folder", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, ".aegis"), { recursive: true });
    await writeFile(join(root, ".aegis", "config.json"), "{}");
    await expect(findRepoRoot(join(root, "src"))).resolves.toBe(root);
  });
  it("rejects paths outside the root", () => {
    expect(() => ensureInsideRoot("C:\\repo", "C:\\outside\\file.md")).toThrow("outside repo root");
  });
});
