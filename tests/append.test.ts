import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appendLocked } from "../src/fs/append.js";
import { createTempRepo } from "./helpers/tempRepo.js";

describe("appendLocked", () => {
  it("preserves complete entries from concurrent writers", async () => {
    const root = await createTempRepo();
    const target = join(root, "log.md");
    const entries = Array.from({ length: 40 }, (_, index) => `\nENTRY-${index}-START\n${"x".repeat(100)}\nENTRY-${index}-END\n`);
    await Promise.all(entries.map((entry) => appendLocked(target, entry)));
    const body = await readFile(target, "utf8");
    for (let index = 0; index < entries.length; index += 1) {
      expect(body).toContain(`ENTRY-${index}-START`);
      expect(body).toContain(`ENTRY-${index}-END`);
    }
    expect(body.match(/ENTRY-\d+-START/g)).toHaveLength(entries.length);
  });
});
