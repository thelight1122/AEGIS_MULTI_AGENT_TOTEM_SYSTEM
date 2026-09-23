# AEGIS Totem MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first free, installable AEGIS Totem CLI that creates append-only repo Totems and per-agent lanes for collision-free AI-assisted development.

**Architecture:** Start with a local-first Node/TypeScript CLI that writes Markdown and JSON files into a repo. The CLI owns append-only operations, validation, status generation, and templates; no cloud service, daemon, database, or IDE extension is required for MVP.

**Tech Stack:** Node.js 20+, TypeScript, `commander`, `zod`, `vitest`, `tsx`, Markdown files, JSON config.

**Spec:** This plan implements the current conversation-derived MVP: root/folder Totems, per-agent lanes, append-only records, direct model-to-model messages, collision avoidance, and free open-source distribution.

## Global Constraints

- Free public tool: no account, hosted backend, license gate, or telemetry in MVP.
- Append-only invariant: never rewrite or delete existing Totem or lane entries through normal CLI commands.
- Repo-native: all durable data lives inside the target repository.
- Human-readable: Totems and lanes are Markdown-first; JSON is used only for config/index metadata.
- Agent-friendly: generated files must contain concise instructions that coding models can follow.
- Collision reduction: each agent lane is separate; shared Totems receive distilled updates only.
- Scoped claims: README may say "designed to reduce collisions" and may describe observed local collision elimination, but must not claim universal prevention without broader evidence.
- Windows support: paths must work on Windows PowerShell and POSIX shells.

## Review Focus

- Existing project files: `aegis init` must not overwrite existing user files; tests in Task 3.
- Duplicate appends: append commands should create new entries, not mutate previous entries; tests in Task 5.
- Invalid lane names: unsafe path names must be rejected; tests in Task 4.
- Nested folder Totems: folder commands must resolve the nearest repo root and target folder correctly; tests in Task 6.
- Generated current views: status/current commands must derive summaries without editing append-only logs; tests in Task 7.

---

## File Structure

- Create: `package.json` - npm scripts, package metadata, CLI binary mapping.
- Create: `tsconfig.json` - TypeScript config for CLI and tests.
- Create: `vitest.config.ts` - test config.
- Create: `src/cli.ts` - CLI entrypoint and command wiring.
- Create: `src/fs/repo.ts` - repo root detection, safe path helpers, file existence checks.
- Create: `src/core/schema.ts` - config and entry schemas with `zod`.
- Create: `src/core/templates.ts` - generated Markdown templates.
- Create: `src/core/init.ts` - initialize AEGIS Totem structure.
- Create: `src/core/lanes.ts` - lane creation and lane append operations.
- Create: `src/core/totems.ts` - folder Totem creation and append operations.
- Create: `src/core/status.ts` - read-only status/current view generation.
- Create: `src/core/validate.ts` - structure and append-only validation.
- Create: `tests/helpers/tempRepo.ts` - temp repo test helper.
- Create: `tests/*.test.ts` - focused tests per feature.
- Create: `README.md` - public positioning, install/use examples.
- Create: `LICENSE` - MIT license.
- Create: `.gitignore` - standard Node/project ignores.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `src/cli.ts`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces: CLI binary `aegis-totem`.
- Produces: test command `npm test`.

- [ ] **Step 1: Create package metadata**

Use this `package.json`:

```json
{
  "name": "aegis-totem",
  "version": "0.1.0",
  "description": "Append-only repo memory and agent lanes for AI-assisted development.",
  "type": "module",
  "bin": {
    "aegis-totem": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsx src/cli.ts",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "tsx": "^4.16.2",
    "typescript": "^5.5.3",
    "vitest": "^2.0.3"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create TypeScript config**

Use this `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"]
}
```

- [ ] **Step 3: Create test config**

Use this `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
```

- [ ] **Step 4: Create CLI smoke entry**

Use this `src/cli.ts`:

```ts
#!/usr/bin/env node
import { Command } from "commander";

export function buildProgram(): Command {
  const program = new Command();
  program
    .name("aegis-totem")
    .description("Append-only repo memory and agent lanes for AI-assisted development.")
    .version("0.1.0");

  program.command("hello").action(() => {
    console.log("AEGIS Totem is ready.");
  });

  return program;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildProgram().parse(process.argv);
}
```

- [ ] **Step 5: Create smoke test**

Use this `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildProgram } from "../src/cli.js";

describe("CLI scaffold", () => {
  it("names the program", () => {
    expect(buildProgram().name()).toBe("aegis-totem");
  });
});
```

- [ ] **Step 6: Run tests and typecheck**

Run:

```bash
npm install
npm test
npm run typecheck
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts .gitignore src/cli.ts tests/smoke.test.ts
git commit -m "chore: scaffold aegis totem cli"
```

## Task 2: Core Schemas And Path Safety

**Files:**
- Create: `src/core/schema.ts`
- Create: `src/fs/repo.ts`
- Create: `tests/schema.test.ts`
- Create: `tests/repo.test.ts`
- Create: `tests/helpers/tempRepo.ts`

**Interfaces:**
- Produces: `sanitizeLaneName(name: string): string`
- Produces: `assertSafeSegment(name: string): string`
- Produces: `findRepoRoot(startDir: string): Promise<string | null>`
- Produces: `ensureInsideRoot(root: string, target: string): string`
- Produces: `TotemConfigSchema`

- [ ] **Step 1: Write schema tests**

Use this `tests/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { sanitizeLaneName } from "../src/core/schema.js";

describe("sanitizeLaneName", () => {
  it("accepts simple lower-case names", () => {
    expect(sanitizeLaneName("codex")).toBe("codex");
  });

  it("normalizes spaces and uppercase", () => {
    expect(sanitizeLaneName("Claude Review")).toBe("claude-review");
  });

  it("rejects traversal", () => {
    expect(() => sanitizeLaneName("../outside")).toThrow("Unsafe lane name");
  });

  it("rejects empty names", () => {
    expect(() => sanitizeLaneName("   ")).toThrow("Unsafe lane name");
  });
});
```

- [ ] **Step 2: Implement schemas**

Use this `src/core/schema.ts`:

```ts
import { z } from "zod";

export const TotemConfigSchema = z.object({
  version: z.literal(1),
  rootTotem: z.string().default("ROOT_TOTEM.md"),
  folderTotem: z.string().default("TOTEM.md"),
  aegisDir: z.string().default(".aegis")
});

export type TotemConfig = z.infer<typeof TotemConfigSchema>;

export function sanitizeLaneName(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!normalized || normalized.includes("..") || normalized.includes("/") || normalized.includes("\\")) {
    throw new Error(`Unsafe lane name: ${name}`);
  }
  return normalized;
}

export function assertSafeSegment(name: string): string {
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error(`Unsafe path segment: ${name}`);
  }
  return name;
}
```

- [ ] **Step 3: Write repo path tests**

Use this `tests/repo.test.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { ensureInsideRoot, findRepoRoot } from "../src/fs/repo.js";

describe("repo helpers", () => {
  it("finds a repo root by .aegis/config.json", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, ".aegis"), { recursive: true });
    await writeFile(join(root, ".aegis", "config.json"), "{}");
    await mkdir(join(root, "src", "feature"), { recursive: true });

    await expect(findRepoRoot(join(root, "src", "feature"))).resolves.toBe(root);
  });

  it("rejects paths outside root", () => {
    const root = "C:\\repo";
    expect(() => ensureInsideRoot(root, "C:\\outside\\file.md")).toThrow("outside repo root");
  });
});
```

- [ ] **Step 4: Implement temp helper**

Use this `tests/helpers/tempRepo.ts`:

```ts
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export async function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "aegis-totem-"));
}
```

- [ ] **Step 5: Implement repo helpers**

Use this `src/fs/repo.ts`:

```ts
import { access } from "node:fs/promises";
import { dirname, resolve, parse } from "node:path";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function findRepoRoot(startDir: string): Promise<string | null> {
  let current = resolve(startDir);
  const root = parse(current).root;

  while (true) {
    if (await exists(resolve(current, ".aegis", "config.json"))) {
      return current;
    }
    if (current === root) return null;
    current = dirname(current);
  }
}

export function ensureInsideRoot(root: string, target: string): string {
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(target);
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + "\\" ) && !resolvedTarget.startsWith(resolvedRoot + "/")) {
    throw new Error(`Refusing to access path outside repo root: ${target}`);
  }
  return resolvedTarget;
}
```

- [ ] **Step 6: Run tests**

```bash
npm test tests/schema.test.ts tests/repo.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/core/schema.ts src/fs/repo.ts tests/schema.test.ts tests/repo.test.ts tests/helpers/tempRepo.ts
git commit -m "feat: add totem schemas and safe repo paths"
```

## Task 3: `aegis-totem init`

**Files:**
- Create: `src/core/templates.ts`
- Create: `src/core/init.ts`
- Modify: `src/cli.ts`
- Create: `tests/init.test.ts`

**Interfaces:**
- Consumes: `TotemConfigSchema`
- Produces: `initTotemRepo(rootDir: string): Promise<void>`

- [ ] **Step 1: Write init tests**

Use this `tests/init.test.ts`:

```ts
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";

describe("initTotemRepo", () => {
  it("creates root Totem, config, templates, and root lane directory", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);

    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toContain("AEGIS Root Totem");
    await expect(readFile(join(root, ".aegis", "config.json"), "utf8")).resolves.toContain("\"version\": 1");
    await expect(readFile(join(root, ".aegis", "templates", "folder-totem.md"), "utf8")).resolves.toContain("Folder Totem");
  });

  it("does not overwrite an existing root Totem", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "ROOT_TOTEM.md"), "custom");

    await expect(initTotemRepo(root)).rejects.toThrow("already exists");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe("custom");
  });
});
```

- [ ] **Step 2: Create templates**

Use this `src/core/templates.ts`:

```ts
export function rootTotemTemplate(createdAt: string): string {
  return `# AEGIS Root Totem

Created: ${createdAt}

## Purpose

This repository uses AEGIS Totems for append-only repo memory, folder-level reference, and per-agent message lanes.

## Operating Rules

- Read this Root Totem before working in the repo.
- Read the nearest folder Totem before editing files in that folder.
- Use your own agent lane for working notes and model-to-model messages.
- Append verified durable updates to the relevant folder Totem.
- Never rewrite or delete prior Totem or lane entries.

## Current Repo State

- Status: initialized
- Known shortfalls: none recorded yet

## Append Log

### ${createdAt} | system | init

Initialized AEGIS Totem structure.
`;
}

export function folderTotemTemplate(folderPath: string, createdAt: string): string {
  return `# Folder Totem: ${folderPath}

Created: ${createdAt}

## Purpose

Describe what this folder owns and how future agents should understand it.

## Local Reference

- Important files: none recorded yet
- Dependencies in: none recorded yet
- Dependencies out: none recorded yet
- Known risks: none recorded yet

## Agent Instructions

- Read this Totem before editing this folder.
- Use a lane under .aegis/lanes for working notes.
- Append only durable verified updates here.

## Append Log

### ${createdAt} | system | create-folder-totem

Created folder Totem.
`;
}

export function laneTemplate(laneName: string, createdAt: string): string {
  return `# AEGIS Agent Lane: ${laneName}

Created: ${createdAt}

## Purpose

Append-only working lane for one agent, model, human, or instance.

## Append Log

### ${createdAt} | ${laneName} | create-lane

Created agent lane.
`;
}

export const folderTotemTemplateDoc = `# Folder Totem

Use this template for folder-level reference and durable updates.
`;

export const laneTemplateDoc = `# Agent Lane

Use this template for append-only agent working notes and model-to-model messages.
`;
```

- [ ] **Step 3: Implement init**

Use this `src/core/init.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { rootTotemTemplate, folderTotemTemplateDoc, laneTemplateDoc } from "./templates.js";

async function writeNewFile(path: string, contents: string): Promise<void> {
  await writeFile(path, contents, { flag: "wx" });
}

export async function initTotemRepo(rootDir: string): Promise<void> {
  const createdAt = new Date().toISOString();
  await mkdir(join(rootDir, ".aegis", "templates"), { recursive: true });
  await mkdir(join(rootDir, ".aegis", "lanes"), { recursive: true });

  await writeNewFile(join(rootDir, "ROOT_TOTEM.md"), rootTotemTemplate(createdAt));
  await writeNewFile(join(rootDir, ".aegis", "config.json"), JSON.stringify({ version: 1, rootTotem: "ROOT_TOTEM.md", folderTotem: "TOTEM.md", aegisDir: ".aegis" }, null, 2) + "\n");
  await writeNewFile(join(rootDir, ".aegis", "templates", "folder-totem.md"), folderTotemTemplateDoc);
  await writeNewFile(join(rootDir, ".aegis", "templates", "agent-lane.md"), laneTemplateDoc);
}
```

- [ ] **Step 4: Wire CLI command**

Modify `src/cli.ts`:

```ts
import { initTotemRepo } from "./core/init.js";
```

Inside `buildProgram()` before return:

```ts
program.command("init")
  .description("Initialize AEGIS Totem files in the current repo.")
  .action(async () => {
    await initTotemRepo(process.cwd());
    console.log("Initialized AEGIS Totem structure.");
  });
```

- [ ] **Step 5: Run tests**

```bash
npm test tests/init.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/core/templates.ts src/core/init.ts src/cli.ts tests/init.test.ts
git commit -m "feat: initialize append-only totem structure"
```

## Task 4: Agent Lanes

**Files:**
- Create: `src/core/lanes.ts`
- Modify: `src/cli.ts`
- Create: `tests/lanes.test.ts`

**Interfaces:**
- Consumes: `sanitizeLaneName(name: string): string`
- Consumes: `laneTemplate(laneName: string, createdAt: string): string`
- Produces: `createLane(rootDir: string, laneName: string): Promise<string>`
- Produces: `appendLaneMessage(rootDir: string, laneName: string, message: string, to?: string): Promise<string>`

- [ ] **Step 1: Write lane tests**

Use this `tests/lanes.test.ts`:

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { appendLaneMessage, createLane } from "../src/core/lanes.js";

describe("lanes", () => {
  it("creates a sanitized agent lane", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);

    const lanePath = await createLane(root, "Claude Review");

    expect(lanePath.endsWith(join(".aegis", "lanes", "claude-review.md"))).toBe(true);
    await expect(readFile(lanePath, "utf8")).resolves.toContain("AEGIS Agent Lane: claude-review");
  });

  it("appends messages without changing existing content", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    const lanePath = await createLane(root, "codex");
    const before = await readFile(lanePath, "utf8");

    await appendLaneMessage(root, "codex", "Please review src/api before editing.", "claude");
    const after = await readFile(lanePath, "utf8");

    expect(after.startsWith(before)).toBe(true);
    expect(after).toContain("To: claude");
    expect(after).toContain("Please review src/api before editing.");
  });
});
```

- [ ] **Step 2: Implement lanes**

Use this `src/core/lanes.ts`:

```ts
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { sanitizeLaneName } from "./schema.js";
import { laneTemplate } from "./templates.js";

export async function createLane(rootDir: string, laneName: string): Promise<string> {
  const safeName = sanitizeLaneName(laneName);
  const lanesDir = join(rootDir, ".aegis", "lanes");
  await mkdir(lanesDir, { recursive: true });
  const lanePath = join(lanesDir, `${safeName}.md`);
  await writeFile(lanePath, laneTemplate(safeName, new Date().toISOString()), { flag: "wx" });
  return lanePath;
}

export async function appendLaneMessage(rootDir: string, laneName: string, message: string, to?: string): Promise<string> {
  const safeName = sanitizeLaneName(laneName);
  const lanePath = join(rootDir, ".aegis", "lanes", `${safeName}.md`);
  const timestamp = new Date().toISOString();
  const addressed = to ? `\nTo: ${sanitizeLaneName(to)}\n` : "";
  const entry = `\n### ${timestamp} | ${safeName} | message${addressed}\n${message.trim()}\n`;
  await appendFile(lanePath, entry, "utf8");
  return lanePath;
}
```

- [ ] **Step 3: Wire CLI commands**

Modify `src/cli.ts`:

```ts
import { appendLaneMessage, createLane } from "./core/lanes.js";
```

Inside `buildProgram()`:

```ts
const lane = program.command("lane").description("Manage append-only agent lanes.");

lane.command("create")
  .argument("<name>")
  .action(async (name: string) => {
    const lanePath = await createLane(process.cwd(), name);
    console.log(`Created lane: ${lanePath}`);
  });

lane.command("message")
  .argument("<lane>")
  .requiredOption("-m, --message <message>")
  .option("--to <lane>")
  .action(async (laneName: string, options: { message: string; to?: string }) => {
    const lanePath = await appendLaneMessage(process.cwd(), laneName, options.message, options.to);
    console.log(`Appended message to: ${lanePath}`);
  });
```

- [ ] **Step 4: Run tests**

```bash
npm test tests/lanes.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/lanes.ts src/cli.ts tests/lanes.test.ts
git commit -m "feat: add append-only agent lanes"
```

## Task 5: Folder Totems And Durable Appends

**Files:**
- Create: `src/core/totems.ts`
- Modify: `src/cli.ts`
- Create: `tests/totems.test.ts`

**Interfaces:**
- Produces: `createFolderTotem(rootDir: string, folderPath: string): Promise<string>`
- Produces: `appendFolderTotem(rootDir: string, folderPath: string, actor: string, kind: string, body: string): Promise<string>`

- [ ] **Step 1: Write folder Totem tests**

Use this `tests/totems.test.ts`:

```ts
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { appendFolderTotem, createFolderTotem } from "../src/core/totems.js";

describe("folder Totems", () => {
  it("creates a visible TOTEM.md in a target folder", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src", "api"), { recursive: true });

    const totemPath = await createFolderTotem(root, "src/api");

    expect(totemPath).toBe(join(root, "src", "api", "TOTEM.md"));
    await expect(readFile(totemPath, "utf8")).resolves.toContain("Folder Totem: src/api");
  });

  it("appends durable updates without mutating prior content", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src"), { recursive: true });
    const totemPath = await createFolderTotem(root, "src");
    const before = await readFile(totemPath, "utf8");

    await appendFolderTotem(root, "src", "codex", "verified-change", "Added route tests. Verification: npm test passed.");
    const after = await readFile(totemPath, "utf8");

    expect(after.startsWith(before)).toBe(true);
    expect(after).toContain("codex | verified-change");
    expect(after).toContain("Added route tests.");
  });
});
```

- [ ] **Step 2: Implement folder Totems**

Use this `src/core/totems.ts`:

```ts
import { appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ensureInsideRoot } from "../fs/repo.js";
import { sanitizeLaneName } from "./schema.js";
import { folderTotemTemplate } from "./templates.js";

export async function createFolderTotem(rootDir: string, folderPath: string): Promise<string> {
  const targetFolder = ensureInsideRoot(rootDir, join(rootDir, folderPath));
  const totemPath = join(targetFolder, "TOTEM.md");
  await writeFile(totemPath, folderTotemTemplate(folderPath.replace(/\\/g, "/"), new Date().toISOString()), { flag: "wx" });
  return totemPath;
}

export async function appendFolderTotem(rootDir: string, folderPath: string, actor: string, kind: string, body: string): Promise<string> {
  const targetFolder = ensureInsideRoot(rootDir, join(rootDir, folderPath));
  const totemPath = join(targetFolder, "TOTEM.md");
  const safeActor = sanitizeLaneName(actor);
  const safeKind = kind.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  if (!safeKind) throw new Error("Append kind is required");
  const timestamp = new Date().toISOString();
  const entry = `\n### ${timestamp} | ${safeActor} | ${safeKind}\n\n${body.trim()}\n`;
  await appendFile(totemPath, entry, "utf8");
  return totemPath;
}
```

- [ ] **Step 3: Wire CLI commands**

Modify `src/cli.ts`:

```ts
import { appendFolderTotem, createFolderTotem } from "./core/totems.js";
```

Inside `buildProgram()`:

```ts
const totem = program.command("totem").description("Manage append-only folder Totems.");

totem.command("create")
  .argument("<folder>")
  .action(async (folder: string) => {
    const totemPath = await createFolderTotem(process.cwd(), folder);
    console.log(`Created folder Totem: ${totemPath}`);
  });

totem.command("append")
  .argument("<folder>")
  .requiredOption("--actor <lane>")
  .requiredOption("--kind <kind>")
  .requiredOption("-m, --message <message>")
  .action(async (folder: string, options: { actor: string; kind: string; message: string }) => {
    const totemPath = await appendFolderTotem(process.cwd(), folder, options.actor, options.kind, options.message);
    console.log(`Appended to folder Totem: ${totemPath}`);
  });
```

- [ ] **Step 4: Run tests**

```bash
npm test tests/totems.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/totems.ts src/cli.ts tests/totems.test.ts
git commit -m "feat: add append-only folder totems"
```

## Task 6: Status And Current Views

**Files:**
- Create: `src/core/status.ts`
- Modify: `src/cli.ts`
- Create: `tests/status.test.ts`

**Interfaces:**
- Produces: `getStatus(rootDir: string): Promise<TotemStatus>`
- Produces: `formatStatus(status: TotemStatus): string`

- [ ] **Step 1: Write status tests**

Use this `tests/status.test.ts`:

```ts
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { createLane } from "../src/core/lanes.js";
import { createFolderTotem } from "../src/core/totems.js";
import { formatStatus, getStatus } from "../src/core/status.js";

describe("status", () => {
  it("reports root, folder Totems, and lanes without editing files", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await createLane(root, "codex");
    await mkdir(join(root, "src"), { recursive: true });
    await createFolderTotem(root, "src");
    const before = await readFile(join(root, "ROOT_TOTEM.md"), "utf8");

    const status = await getStatus(root);
    const rendered = formatStatus(status);

    expect(status.lanes).toContain("codex.md");
    expect(status.folderTotems).toContain("src/TOTEM.md");
    expect(rendered).toContain("Agent lanes: 1");
    await expect(readFile(join(root, "ROOT_TOTEM.md"), "utf8")).resolves.toBe(before);
  });
});
```

- [ ] **Step 2: Implement status**

Use this `src/core/status.ts`:

```ts
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export type TotemStatus = {
  root: string;
  rootTotem: boolean;
  lanes: string[];
  folderTotems: string[];
};

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await walk(path));
    } else {
      results.push(path);
    }
  }
  return results;
}

export async function getStatus(rootDir: string): Promise<TotemStatus> {
  const files = await walk(rootDir);
  const lanesPrefix = join(rootDir, ".aegis", "lanes");
  return {
    root: rootDir,
    rootTotem: files.includes(join(rootDir, "ROOT_TOTEM.md")),
    lanes: files.filter((file) => file.startsWith(lanesPrefix) && file.endsWith(".md")).map((file) => relative(lanesPrefix, file).replace(/\\/g, "/")),
    folderTotems: files.filter((file) => file.endsWith("TOTEM.md") && !file.endsWith("ROOT_TOTEM.md")).map((file) => relative(rootDir, file).replace(/\\/g, "/"))
  };
}

export function formatStatus(status: TotemStatus): string {
  return [
    `AEGIS Totem status for ${status.root}`,
    `Root Totem: ${status.rootTotem ? "present" : "missing"}`,
    `Folder Totems: ${status.folderTotems.length}`,
    `Agent lanes: ${status.lanes.length}`
  ].join("\n");
}
```

- [ ] **Step 3: Wire status command**

Modify `src/cli.ts`:

```ts
import { formatStatus, getStatus } from "./core/status.js";
```

Inside `buildProgram()`:

```ts
program.command("status")
  .description("Show a read-only current view of AEGIS Totem files.")
  .action(async () => {
    console.log(formatStatus(await getStatus(process.cwd())));
  });
```

- [ ] **Step 4: Run tests**

```bash
npm test tests/status.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/status.ts src/cli.ts tests/status.test.ts
git commit -m "feat: add read-only totem status view"
```

## Task 7: Validation

**Files:**
- Create: `src/core/validate.ts`
- Modify: `src/cli.ts`
- Create: `tests/validate.test.ts`

**Interfaces:**
- Produces: `validateRepo(rootDir: string): Promise<ValidationResult>`
- Produces: `formatValidation(result: ValidationResult): string`

- [ ] **Step 1: Write validation tests**

Use this `tests/validate.test.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTempRepo } from "./helpers/tempRepo.js";
import { initTotemRepo } from "../src/core/init.js";
import { validateRepo } from "../src/core/validate.js";

describe("validateRepo", () => {
  it("passes initialized repo", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);

    const result = await validateRepo(root);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("flags missing append log in folder Totem", async () => {
    const root = await createTempRepo();
    await initTotemRepo(root);
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "TOTEM.md"), "# Bad Totem\n");

    const result = await validateRepo(root);

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing Append Log");
  });
});
```

- [ ] **Step 2: Implement validation**

Use this `src/core/validate.ts`:

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStatus } from "./status.js";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export async function validateRepo(rootDir: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const status = await getStatus(rootDir);

  if (!status.rootTotem) errors.push("ROOT_TOTEM.md is missing");

  for (const relPath of status.folderTotems) {
    const body = await readFile(join(rootDir, relPath), "utf8");
    if (!body.includes("## Append Log")) {
      errors.push(`${relPath} is missing Append Log`);
    }
  }

  for (const lane of status.lanes) {
    const body = await readFile(join(rootDir, ".aegis", "lanes", lane), "utf8");
    if (!body.includes("## Append Log")) {
      errors.push(`lane ${lane} is missing Append Log`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function formatValidation(result: ValidationResult): string {
  if (result.ok) return "AEGIS Totem validation passed.";
  return ["AEGIS Totem validation failed:", ...result.errors.map((error) => `- ${error}`)].join("\n");
}
```

- [ ] **Step 3: Wire validate command**

Modify `src/cli.ts`:

```ts
import { formatValidation, validateRepo } from "./core/validate.js";
```

Inside `buildProgram()`:

```ts
program.command("validate")
  .description("Validate AEGIS Totem structure.")
  .action(async () => {
    const result = await validateRepo(process.cwd());
    console.log(formatValidation(result));
    if (!result.ok) process.exitCode = 1;
  });
```

- [ ] **Step 4: Run tests**

```bash
npm test tests/validate.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/validate.ts src/cli.ts tests/validate.test.ts
git commit -m "feat: validate totem structure"
```

## Task 8: README, License, And First Release Copy

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Modify: `package.json`

**Interfaces:**
- Produces: public install and usage documentation.
- Produces: clear scoped value proposition.

- [ ] **Step 1: Write README**

Use this opening:

```md
# AEGIS Totem

Collision-free coordination for AI coding agents.

AEGIS Totem gives your repo append-only folder memory and per-agent message lanes, so humans and AI coding tools can work in parallel without losing context or stepping on each other.

We built this after coordinating multiple desktop coding models in the same repo. Folder Totems and Agent Lanes eliminated collisions in that workflow, so this tool is released free for other developers facing similar AI-coding coordination problems.

## Core Ideas

- Root Totem: repo-wide orientation and current state.
- Folder Totem: local reference for each folder.
- Agent Lane: append-only working/message channel for one agent, model, instance, or human.
- Distillation: durable verified updates are promoted from lanes into folder Totems.
- Append-only: corrections and supersessions are added as new entries; prior records are not overwritten.

## Install

\`\`\`bash
npm install -g aegis-totem
\`\`\`

## Quick Start

\`\`\`bash
aegis-totem init
aegis-totem lane create codex
aegis-totem lane create claude
aegis-totem totem create src
aegis-totem lane message codex --to claude -m "I inspected src. Please review the parser boundary before editing."
aegis-totem totem append src --actor codex --kind verified-change -m "Added parser tests. Verification: npm test passed."
aegis-totem status
aegis-totem validate
\`\`\`
```

- [ ] **Step 2: Add MIT license**

Use the standard MIT license text with copyright holder:

```text
Copyright (c) 2026 Tracey Prutch
```

- [ ] **Step 3: Add package keywords**

Modify `package.json`:

```json
"keywords": [
  "aegis",
  "ai-coding",
  "agents",
  "repo-memory",
  "developer-tools",
  "cli"
]
```

- [ ] **Step 4: Run full verification**

```bash
npm test
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add README.md LICENSE package.json
git commit -m "docs: describe aegis totem mvp"
```

## Task 9: Dogfood The Tool In Its Own Repo

**Files:**
- Generated: `ROOT_TOTEM.md`
- Generated: `.aegis/config.json`
- Generated: `.aegis/templates/folder-totem.md`
- Generated: `.aegis/templates/agent-lane.md`
- Generated: `.aegis/lanes/codex.md`
- Generated: `src/TOTEM.md`
- Generated: `tests/TOTEM.md`

**Interfaces:**
- Consumes: all CLI commands from previous tasks.
- Produces: a real AEGIS Totem structure inside the tool repo.

- [ ] **Step 1: Run local build**

```bash
npm run build
```

Expected: pass.

- [ ] **Step 2: Initialize the repo**

```bash
node dist/cli.js init
```

Expected: creates root Totem and `.aegis`.

- [ ] **Step 3: Create lanes**

```bash
node dist/cli.js lane create codex
node dist/cli.js lane create human
```

Expected: creates `.aegis/lanes/codex.md` and `.aegis/lanes/human.md`.

- [ ] **Step 4: Create folder Totems**

```bash
node dist/cli.js totem create src
node dist/cli.js totem create tests
```

Expected: creates `src/TOTEM.md` and `tests/TOTEM.md`.

- [ ] **Step 5: Append dogfood note**

```bash
node dist/cli.js lane message codex --to human -m "Dogfooding AEGIS Totem inside its own repo. Verified init, lane creation, folder Totems, status, and validation."
node dist/cli.js totem append src --actor codex --kind dogfood-verification -m "CLI generated its own repo Totem structure after build."
```

Expected: appends to lane and folder Totem.

- [ ] **Step 6: Validate**

```bash
node dist/cli.js status
node dist/cli.js validate
```

Expected: status prints counts; validation passes.

- [ ] **Step 7: Commit**

```bash
git add ROOT_TOTEM.md .aegis src/TOTEM.md tests/TOTEM.md
git commit -m "chore: dogfood aegis totem structure"
```

## Future Plan, Not MVP

- VS Code extension with Totem sidebar, lane inbox, and append prompts.
- Git hook integration for pre-commit validation.
- Generated current-state indexes from append logs.
- Optional MCP server for direct model access to Totems and lanes.
- Importers for existing `AGENTS.md`, `CLAUDE.md`, and repo docs.
- Conflict analytics across lanes.

## Self-Review

- Spec coverage: Plan covers root Totem, folder Totems, per-agent lanes, append-only operation, status views, validation, free/open positioning, and dogfooding.
- Placeholder scan: No `TBD`, `TODO`, or unspecified "handle errors" placeholders remain.
- Type consistency: Function names and return types are introduced before use and reused consistently.
- Review Focus: All five listed failure modes are assigned tests in Tasks 3, 4, 5, 6, and 7.
