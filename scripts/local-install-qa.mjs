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

  const status = runCli(["status"]);
  const validate = runCli(["validate"]);

  assertExists(join(targetRepo, "ROOT_TOTEM.md"));
  assertExists(join(targetRepo, ".aegis", "config.json"));
  assertExists(join(targetRepo, ".aegis", "lanes", "codex.md"));
  assertExists(join(targetRepo, ".aegis", "lanes", "claude.md"));
  assertExists(join(targetRepo, "src", "TOTEM.md"));

  const codexLane = readFileSync(join(targetRepo, ".aegis", "lanes", "codex.md"), "utf8");
  const folderTotem = readFileSync(join(targetRepo, "src", "TOTEM.md"), "utf8");

  if (!codexLane.includes("Local install QA lane message.")) {
    throw new Error("Expected lane message was not written.");
  }

  if (!folderTotem.includes("Verified local install QA append path.")) {
    throw new Error("Expected Folder Totem append was not written.");
  }

  if (!status.includes("Folder Totems: 1") || !status.includes("Agent lanes: 2")) {
    throw new Error(`Unexpected status output:\n${status}`);
  }

  if (!validate.includes("AEGIS Totem validation passed.")) {
    throw new Error(`Unexpected validate output:\n${validate}`);
  }

  console.log("Local install QA passed.");
} finally {
  if (existsSync(cliPackage)) {
    rmSync(cliPackage, { force: true });
  }

  rmSync(sandbox, { force: true, recursive: true });
}
