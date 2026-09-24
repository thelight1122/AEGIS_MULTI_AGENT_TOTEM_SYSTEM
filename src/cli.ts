#!/usr/bin/env node
import { Command } from "commander";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initTotemRepo } from "./core/init.js";
import { appendLaneMessage, createLane } from "./core/lanes.js";
import { appendFolderTotem, createFolderTotem } from "./core/totems.js";
import { formatInventory, formatStatus, getStatus, resolveInventoryScope } from "./core/status.js";
import { formatValidation, validateRepo } from "./core/validate.js";
import { formatAnalytics, getAnalytics } from "./core/analytics.js";
import { formatDoctor, runDoctor } from "./core/doctor.js";
import { installPreCommitHook } from "./core/hooks.js";
import { buildMcpConfig } from "./core/mcp-config.js";
import { readFolderTotem, readLane, readRootTotem } from "./core/read.js";

export function buildProgram(): Command {
  const program = new Command()
    .name("aegis-totem")
    .description("Append-only repo memory and agent lanes for AI-assisted development.")
    .version("0.1.0");

  program.command("init").description("Initialize AEGIS Totem files in the current repository.")
    .action(async () => { await initTotemRepo(process.cwd()); console.log("Initialized AEGIS Totem."); });

  const lane = program.command("lane").description("Manage append-only agent lanes.");
  lane.command("create").argument("<name>")
    .action(async (name: string) => console.log(`Created lane: ${await createLane(process.cwd(), name)}`));
  lane.command("message").argument("<lane>").requiredOption("-m, --message <message>").option("--to <lane>")
    .action(async (laneName: string, options: { message: string; to?: string }) => {
      console.log(`Appended message to: ${await appendLaneMessage(process.cwd(), laneName, options.message, options.to)}`);
    });

  const totem = program.command("totem").description("Manage append-only folder Totems.");
  totem.command("create").argument("<folder>")
    .action(async (folder: string) => console.log(`Created folder Totem: ${await createFolderTotem(process.cwd(), folder)}`));
  totem.command("append").argument("<folder>").requiredOption("--actor <lane>").requiredOption("--kind <kind>").requiredOption("-m, --message <message>")
    .action(async (folder: string, options: { actor: string; kind: string; message: string }) => {
      console.log(`Appended to folder Totem: ${await appendFolderTotem(process.cwd(), folder, options.actor, options.kind, options.message)}`);
    });

  program.command("status").description("Show a read-only current view of AEGIS Totem files.")
    .action(async () => console.log(formatStatus(await getStatus(process.cwd()))));
  program.command("list").description("List discovered lanes and Folder Totems.")
    .option("--json", "Print machine-readable inventory.")
    .option("--lanes", "Show only agent lanes.")
    .option("--folders", "Show only Folder Totems.")
    .action(async (options: { json?: boolean; lanes?: boolean; folders?: boolean }) => {
      const status = await getStatus(process.cwd());
      const scope = resolveInventoryScope(options);
      const json = scope === "lanes" ? status.lanes : scope === "folders" ? status.folderTotems : status;
      console.log(options.json ? JSON.stringify(json, null, 2) : formatInventory(status, scope));
    });
  const read = program.command("read").description("Read Totems and lanes without editing repository files.");
  read.command("root").description("Read the repository Root Totem.")
    .action(async () => console.log(await readRootTotem(process.cwd())));
  read.command("lane").description("Read an append-only agent lane.").argument("<lane>")
    .action(async (laneName: string) => console.log(await readLane(process.cwd(), laneName)));
  read.command("folder").description("Read a Folder Totem by repository-relative folder path.").argument("<folder>")
    .action(async (folder: string) => console.log(await readFolderTotem(process.cwd(), folder)));
  program.command("analytics").description("Show read-only append activity counts for Totems and lanes.")
    .option("--json", "Print machine-readable analytics.")
    .action(async (options: { json?: boolean }) => {
      const analytics = await getAnalytics(process.cwd());
      console.log(options.json ? JSON.stringify(analytics, null, 2) : formatAnalytics(analytics));
    });
  program.command("validate").description("Validate AEGIS Totem structure.")
    .action(async () => {
      const result = await validateRepo(process.cwd());
      console.log(formatValidation(result));
      if (!result.ok) process.exitCode = 1;
    });
  program.command("doctor").description("Run a read-only readiness check for AEGIS Totem coordination.")
    .option("--json", "Print machine-readable readiness checks.")
    .action(async (options: { json?: boolean }) => {
      const result = await runDoctor(process.cwd());
      console.log(options.json ? JSON.stringify(result, null, 2) : formatDoctor(result));
      if (!result.ok) process.exitCode = 1;
    });

  const hooks = program.command("hooks").description("Install optional local Git hooks.");
  hooks.command("install").description("Install a local pre-commit hook that runs AEGIS validation.")
    .action(async () => console.log(`Installed AEGIS pre-commit hook: ${await installPreCommitHook(process.cwd())}`));

  const mcp = program.command("mcp").description("Print local MCP client configuration.");
  mcp.command("config").description("Print copyable stdio MCP configuration for this repository.")
    .option("--repo <path>", "Repository root for AEGIS_REPO_ROOT.", process.cwd())
    .option("--server <path>", "Built MCP server path.")
    .option("--name <name>", "MCP server name.", "aegis-totem")
    .action((options: { repo: string; server?: string; name: string }) => {
      const cliDir = dirname(fileURLToPath(import.meta.url));
      const serverPath = options.server ? resolve(options.server) : resolve(cliDir, "mcp-server.js");
      console.log(buildMcpConfig({
        repoRoot: resolve(options.repo),
        serverPath,
        serverName: options.name
      }));
    });

  return program;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  buildProgram().parse(process.argv);
}
