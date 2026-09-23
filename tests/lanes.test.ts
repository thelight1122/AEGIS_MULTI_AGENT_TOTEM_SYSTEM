import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { appendLaneMessage, createLane } from "../src/core/lanes.js";

describe("agent lanes", () => {
  it("creates normalized lanes and appends messages", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const path = await createLane(root, "Claude Review");
    const before = await readFile(path, "utf8");
    await appendLaneMessage(root, "Claude Review", "Please inspect the parser.", "codex");
    const after = await readFile(path, "utf8");
    expect(path).toBe(join(root, ".aegis", "lanes", "claude-review.md"));
    expect(after.startsWith(before)).toBe(true);
    expect(after).toContain("To: codex");
  });
});
