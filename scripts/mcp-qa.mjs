import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = process.cwd();
const sandbox = mkdtempSync(join(tmpdir(), "aegis-totem-mcp-qa-"));
const targetRepo = join(sandbox, "target-repo");
const cliPath = join(root, "dist", "src", "cli.js");
const serverPath = join(root, "dist", "src", "mcp-server.js");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    shell: false
  });

  if (result.status !== 0) {
    throw new Error([
      `Command failed: ${command} ${args.join(" ")}`,
      result.stdout,
      result.stderr
    ].filter(Boolean).join("\n"));
  }

  return `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
}

function runCli(args) {
  return run(process.execPath, [cliPath, ...args], { cwd: targetRepo });
}

function text(result) {
  const first = result.content?.find((item) => item.type === "text");
  if (!first) {
    throw new Error(`Expected text content from MCP tool: ${JSON.stringify(result)}`);
  }

  return first.text;
}

function assertIncludes(value, expected, label) {
  if (!value.includes(expected)) {
    throw new Error(`${label} did not include expected text: ${expected}\n\n${value}`);
  }
}

try {
  run(process.execPath, ["-e", "require('fs').mkdirSync('target-repo')"], { cwd: sandbox });
  runCli(["init"]);
  runCli(["lane", "create", "codex"]);
  runCli(["totem", "create", "src"]);
  run(process.execPath, ["-e", "require('fs').mkdirSync('.git')"], { cwd: targetRepo });
  runCli(["hooks", "install"]);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: root,
    env: { ...process.env, AEGIS_REPO_ROOT: targetRepo },
    stderr: "pipe"
  });
  const client = new Client({ name: "aegis-totem-mcp-qa", version: "0.1.0" });

  await client.connect(transport);

  const tools = await client.listTools();
  const toolNames = new Set(tools.tools.map((tool) => tool.name));
  for (const name of [
    "aegis_start",
    "aegis_read_root_totem",
    "aegis_read_folder_totem",
    "aegis_read_lane",
    "aegis_send_lane_message",
    "aegis_append_folder_update",
    "aegis_status",
    "aegis_list",
    "aegis_analytics",
    "aegis_validate",
    "aegis_doctor"
  ]) {
    if (!toolNames.has(name)) {
      throw new Error(`Expected MCP tool missing: ${name}`);
    }
  }

  const startedRepo = join(sandbox, "started-repo");
  run(process.execPath, ["-e", "require('fs').mkdirSync('started-repo/src/core/parser',{recursive:true}); require('fs').mkdirSync('started-repo/docs',{recursive:true});"], { cwd: sandbox });
  const startTransport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: root,
    env: { ...process.env, AEGIS_REPO_ROOT: startedRepo },
    stderr: "pipe"
  });
  const startClient = new Client({ name: "aegis-totem-mcp-start-qa", version: "0.1.0" });
  await startClient.connect(startTransport);
  const startJson = JSON.parse(text(await startClient.callTool({ name: "aegis_start", arguments: {} })));
  await startClient.close();

  if (startJson.ready !== true || startJson.seededFolderTotems !== 2 || startJson.root !== startedRepo.replaceAll("\\", "/")) {
    throw new Error(`Unexpected MCP start output:\n${JSON.stringify(startJson, null, 2)}`);
  }
  if (!existsSync(join(startedRepo, "ROOT_TOTEM.md")) || !existsSync(join(startedRepo, "src", "TOTEM.md")) || !existsSync(join(startedRepo, "src", "core", "TOTEM.md"))) {
    throw new Error("MCP start did not create expected Totem files.");
  }

  assertIncludes(text(await client.callTool({ name: "aegis_read_root_totem", arguments: {} })), "# AEGIS Root Totem", "Root Totem read");
  assertIncludes(text(await client.callTool({ name: "aegis_read_folder_totem", arguments: { folder: "src" } })), "# Folder Totem: src", "Folder Totem read");
  assertIncludes(text(await client.callTool({ name: "aegis_read_lane", arguments: { lane: "codex" } })), "# AEGIS Agent Lane: codex", "Lane read");

  await client.callTool({
    name: "aegis_send_lane_message",
    arguments: { lane: "codex", to: "claude", message: "MCP QA lane message." }
  });
  await client.callTool({
    name: "aegis_append_folder_update",
    arguments: { folder: "src", actor: "codex", kind: "mcp-qa", message: "Verified MCP folder append path." }
  });

  const lane = readFileSync(join(targetRepo, ".aegis", "lanes", "codex.md"), "utf8");
  const folderTotem = readFileSync(join(targetRepo, "src", "TOTEM.md"), "utf8");
  assertIncludes(lane, "MCP QA lane message.", "MCP lane append");
  assertIncludes(folderTotem, "Verified MCP folder append path.", "MCP Folder Totem append");

  assertIncludes(text(await client.callTool({ name: "aegis_status", arguments: {} })), "Folder Totems: 1", "MCP status");
  assertIncludes(text(await client.callTool({ name: "aegis_status", arguments: {} })), "Agent lanes: 1", "MCP status");
  assertIncludes(text(await client.callTool({ name: "aegis_list", arguments: {} })), "- codex.md", "MCP list");
  assertIncludes(text(await client.callTool({ name: "aegis_list", arguments: {} })), "- src/TOTEM.md", "MCP list");
  assertIncludes(text(await client.callTool({ name: "aegis_list", arguments: { lanes: true } })), "AEGIS Totem lanes", "MCP lane list");
  assertIncludes(text(await client.callTool({ name: "aegis_list", arguments: { folders: true } })), "AEGIS Folder Totems", "MCP folder list");
  assertIncludes(text(await client.callTool({ name: "aegis_analytics", arguments: {} })), "Lane message entries: 1", "MCP analytics");
  assertIncludes(text(await client.callTool({ name: "aegis_analytics", arguments: {} })), "Folder append entries: 1", "MCP analytics");
  assertIncludes(text(await client.callTool({ name: "aegis_validate", arguments: {} })), "AEGIS Totem validation passed.", "MCP validate");
  assertIncludes(text(await client.callTool({ name: "aegis_doctor", arguments: {} })), "AEGIS Totem doctor passed.", "MCP doctor");

  await client.close();

  console.log("MCP QA passed.");
} finally {
  rmSync(sandbox, { force: true, recursive: true });
}
