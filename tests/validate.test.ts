import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
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
});
