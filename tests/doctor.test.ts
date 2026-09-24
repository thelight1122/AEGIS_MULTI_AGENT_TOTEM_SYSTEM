import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appendLaneMessage, createLane } from "../src/core/lanes.js";
import { appendFolderTotem, createFolderTotem } from "../src/core/totems.js";
import { formatDoctor, runDoctor } from "../src/core/doctor.js";
import { initTotemRepo } from "../src/core/init.js";
import { installPreCommitHook } from "../src/core/hooks.js";
import { createTempRepo } from "./helpers/tempRepo.js";

describe("doctor", () => {
  it("reports readiness gaps without editing files", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const before = await readFile(join(root, "ROOT_TOTEM.md"), "utf8");

    const result = await runDoctor(root);

    expect(result.ok).toBe(false);
    expect(formatDoctor(result)).toContain("AEGIS Totem doctor found readiness gaps:");
    expect(formatDoctor(result)).toContain("WARN Agent lanes:");
    expect(formatDoctor(result)).toContain("WARN Folder Totems:");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe(before);
  });

  it("passes when repo has Totems, lanes, appends, and local hook", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await createLane(root, "codex");
    await appendLaneMessage(root, "codex", "Doctor test message.");
    await mkdir(join(root, "src"), { recursive: true });
    await createFolderTotem(root, "src");
    await appendFolderTotem(root, "src", "codex", "doctor-test", "Doctor test append.");
    await mkdir(join(root, ".git"), { recursive: true });
    await installPreCommitHook(root);

    const result = await runDoctor(root);

    expect(result.ok).toBe(true);
    expect(formatDoctor(result)).toContain("AEGIS Totem doctor passed.");
    expect(formatDoctor(result)).toContain("OK Local validation hook:");
  });
});
