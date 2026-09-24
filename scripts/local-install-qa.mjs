import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const cliPackage = join(root, "aegis-totem-0.1.0.tgz");
const sandbox = mkdtempSync(join(tmpdir(), "aegis-totem-install-qa-"));
const targetRepo = join(sandbox, "target-repo");
const installedCli = join(sandbox, "node_modules", "aegis-totem", "dist", "src", "cli.js");
const npmCli = process.env.npm_execpath;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    shell: options.shell ?? false
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

function runNpm(args, options = {}) {
  if (npmCli) {
    return run(process.execPath, [npmCli, ...args], options);
  }

  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

function runCli(args) {
  return run(process.execPath, [installedCli, ...args], { cwd: targetRepo });
}

function assertExists(path) {
  if (!existsSync(path)) {
    throw new Error(`Expected file to exist: ${path}`);
  }
}

try {
  runNpm(["pack"]);
  runNpm(["init", "-y"], { cwd: sandbox });
  runNpm(["install", cliPackage], { cwd: sandbox });
  run(process.execPath, ["-e", "require('fs').mkdirSync('target-repo')"], { cwd: sandbox });

  runCli(["init"]);
  runCli(["lane", "create", "codex"]);
  runCli(["lane", "create", "claude"]);
  runCli(["totem", "create", "src"]);
  runCli(["lane", "message", "codex", "--to", "claude", "-m", "Local install QA lane message."]);
  runCli(["totem", "append", "src", "--actor", "codex", "--kind", "local-install-qa", "-m", "Verified local install QA append path."]);
  run(process.execPath, ["-e", "require('fs').mkdirSync('.git')"], { cwd: targetRepo });
  runCli(["hooks", "install"]);

  const status = runCli(["status"]);
  const inventory = runCli(["list"]);
  const inventoryJson = JSON.parse(runCli(["list", "--json"]));
  const laneInventory = runCli(["list", "--lanes"]);
  const folderInventory = runCli(["list", "--folders"]);
  const analytics = runCli(["analytics"]);
  const analyticsJson = JSON.parse(runCli(["analytics", "--json"]));
  const validate = runCli(["validate"]);
  const doctor = runCli(["doctor"]);
  const doctorJson = JSON.parse(runCli(["doctor", "--json"]));
  const mcpConfig = JSON.parse(runCli(["mcp", "config", "--server", "G:/AEGIS_MULTI_AGENT_TOTEM_SYSTEM/dist/src/mcp-server.js"]));

  assertExists(join(targetRepo, "ROOT_TOTEM.md"));
  assertExists(join(targetRepo, ".aegis", "config.json"));
  assertExists(join(targetRepo, ".aegis", "lanes", "codex.md"));
  assertExists(join(targetRepo, ".aegis", "lanes", "claude.md"));
  assertExists(join(targetRepo, "src", "TOTEM.md"));
  assertExists(join(targetRepo, ".git", "hooks", "pre-commit"));

  const codexLane = readFileSync(join(targetRepo, ".aegis", "lanes", "codex.md"), "utf8");
  const folderTotem = readFileSync(join(targetRepo, "src", "TOTEM.md"), "utf8");

  if (!codexLane.includes("Local install QA lane message.")) {
    throw new Error("Expected lane message was not written.");
  }

  if (!folderTotem.includes("Verified local install QA append path.")) {
    throw new Error("Expected Folder Totem append was not written.");
  }

  if (!readFileSync(join(targetRepo, ".git", "hooks", "pre-commit"), "utf8").includes("aegis-totem validate")) {
    throw new Error("Expected pre-commit hook to run aegis-totem validate.");
  }

  if (!status.includes("Folder Totems: 1") || !status.includes("Agent lanes: 2")) {
    throw new Error(`Unexpected status output:\n${status}`);
  }

  if (!inventory.includes("- codex.md") || !inventory.includes("- claude.md") || !inventory.includes("- src/TOTEM.md")) {
    throw new Error(`Unexpected list output:\n${inventory}`);
  }

  if (!inventoryJson.lanes.includes("codex.md") || !inventoryJson.folderTotems.includes("src/TOTEM.md")) {
    throw new Error(`Unexpected list JSON output:\n${JSON.stringify(inventoryJson, null, 2)}`);
  }

  if (!laneInventory.includes("- codex.md") || laneInventory.includes("src/TOTEM.md")) {
    throw new Error(`Unexpected lane list output:\n${laneInventory}`);
  }

  if (!folderInventory.includes("- src/TOTEM.md") || folderInventory.includes("codex.md")) {
    throw new Error(`Unexpected Folder Totem list output:\n${folderInventory}`);
  }

  if (!analytics.includes("Lane message entries: 1") || !analytics.includes("Folder append entries: 1") || !analytics.includes("Quiet lanes: 1")) {
    throw new Error(`Unexpected analytics output:\n${analytics}`);
  }

  if (analyticsJson.activeLaneCount !== 1 || analyticsJson.quietLaneCount !== 1 || analyticsJson.lastActivity === undefined) {
    throw new Error(`Unexpected analytics JSON output:\n${JSON.stringify(analyticsJson, null, 2)}`);
  }

  if (!validate.includes("AEGIS Totem validation passed.")) {
    throw new Error(`Unexpected validate output:\n${validate}`);
  }

  if (!doctor.includes("AEGIS Totem doctor passed.") || !doctor.includes("OK Local validation hook:")) {
    throw new Error(`Unexpected doctor output:\n${doctor}`);
  }

  if (doctorJson.ok !== true || !doctorJson.checks.some((check) => check.label === "Local validation hook" && check.ok === true)) {
    throw new Error(`Unexpected doctor JSON output:\n${JSON.stringify(doctorJson, null, 2)}`);
  }

  if (mcpConfig.mcpServers?.["aegis-totem"]?.env?.AEGIS_REPO_ROOT !== targetRepo.replaceAll("\\", "/")) {
    throw new Error(`Unexpected MCP config output:\n${JSON.stringify(mcpConfig, null, 2)}`);
  }

  console.log("Local install QA passed.");
} finally {
  if (existsSync(cliPackage)) {
    rmSync(cliPackage, { force: true });
  }

  rmSync(sandbox, { force: true, recursive: true });
}
