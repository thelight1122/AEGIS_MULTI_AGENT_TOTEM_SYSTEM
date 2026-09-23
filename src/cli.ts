#!/usr/bin/env node
import { Command } from "commander";
import { fileURLToPath } from "node:url";
import { initTotemRepo } from "./core/init.js";
import { appendLaneMessage, createLane } from "./core/lanes.js";
import { appendFolderTotem, createFolderTotem } from "./core/totems.js";
import { formatStatus, getStatus } from "./core/status.js";
import { formatValidation, validateRepo } from "./core/validate.js";

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
  program.command("validate").description("Validate AEGIS Totem structure.")
    .action(async () => {
      const result = await validateRepo(process.cwd());
      console.log(formatValidation(result));
      if (!result.ok) process.exitCode = 1;
    });

  return program;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  buildProgram().parse(process.argv);
}
