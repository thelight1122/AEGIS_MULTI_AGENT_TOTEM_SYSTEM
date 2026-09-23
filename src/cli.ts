#!/usr/bin/env node
import { Command } from "commander";

export function buildProgram(): Command {
  return new Command()
    .name("aegis-totem")
    .description("Append-only repo memory and agent lanes for AI-assisted development.")
    .version("0.1.0");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildProgram().parse(process.argv);
}
