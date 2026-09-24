import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { installPreCommitHook } from "../src/core/hooks.js";
import { createTempRepo } from "./helpers/tempRepo.js";

describe("hooks", () => {
  it("installs an opt-in pre-commit validation hook without overwriting", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, ".git"), { recursive: true });

    const hookPath = await installPreCommitHook(root);
    const hook = await readFile(hookPath, "utf8");

    expect(hookPath).toBe(join(root, ".git", "hooks", "pre-commit"));
    expect(hook).toContain("aegis-totem validate");
    await expect(installPreCommitHook(root)).rejects.toThrow();
  });
});
