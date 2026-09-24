import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function fail(message) {
  console.error(`Docs QA failed: ${message}`);
  process.exit(1);
}

function requireFile(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) fail(`missing ${relativePath}`);
  return readFileSync(path, "utf8");
}

function requireIncludes(text, expected, label) {
  if (!text.includes(expected)) fail(`${label} missing ${expected}`);
}

const readme = requireFile("README.md");
const quickstart = requireFile("docs/quickstart.md");
const mcpClients = requireFile("docs/mcp-clients.md");
const firstRepo = requireFile("docs/first-repo-walkthrough.md");

requireIncludes(readme, "docs/mcp-clients.md", "README project records");
requireIncludes(readme, "docs/first-repo-walkthrough.md", "README project records");
requireIncludes(readme, "aegis-totem analytics --json", "README analytics JSON");
requireIncludes(readme, "aegis-totem list", "README list");
requireIncludes(readme, "--lanes", "README list filters");
requireIncludes(readme, "aegis-totem read root", "README read root");
requireIncludes(readme, "List/Analytics/Doctor panel", "README VS Code panels");
requireIncludes(readme, "aegis-totem doctor", "README doctor");
requireIncludes(readme, "aegis-totem doctor --json", "README doctor JSON");
requireIncludes(readme, "aegis-totem mcp config", "README MCP config");
requireIncludes(quickstart, "mcp-clients.md", "quickstart MCP section");
requireIncludes(quickstart, "first-repo-walkthrough.md", "quickstart first repo section");
requireIncludes(quickstart, "aegis-totem analytics --json", "quickstart analytics JSON");
requireIncludes(quickstart, "aegis-totem list", "quickstart list");
requireIncludes(quickstart, "aegis-totem list --lanes", "quickstart list filters");
requireIncludes(quickstart, "aegis-totem read root", "quickstart read root");
requireIncludes(quickstart, "AEGIS: Show List", "quickstart VS Code list");
requireIncludes(quickstart, "aegis-totem doctor", "quickstart doctor");
requireIncludes(quickstart, "aegis-totem doctor --json", "quickstart doctor JSON");
requireIncludes(quickstart, "aegis-totem mcp config", "quickstart MCP config");

for (const expected of [
  "aegis-totem mcp config",
  "AEGIS_REPO_ROOT",
  "dist/src/mcp-server.js",
  "Cursor Shape",
  "Claude Desktop Shape",
  "Cline Shape",
  "Windsurf Shape",
  "Smoke Test The Server",
  "aegis_read_root_totem",
  "aegis_read_folder_totem",
  "aegis_read_lane",
  "aegis_send_lane_message",
  "aegis_append_folder_update",
  "aegis_status",
  "aegis_list",
  "lanes",
  "folders",
  "aegis_analytics",
  "aegis_validate",
  "aegis_doctor"
]) {
  requireIncludes(mcpClients, expected, "MCP client examples");
}

for (const expected of [
  "aegis-totem start",
  "aegis-totem lane create codex",
  "AGENTS.md",
  "<branch-folder>/TOTEM.md",
  "aegis-totem lane message codex",
  "aegis-totem totem append src",
  "aegis-totem list",
  "aegis-totem read root",
  "aegis-totem doctor",
  "aegis-totem mcp config",
  "aegis-totem hooks install",
  "MCP client examples"
]) {
  requireIncludes(firstRepo, expected, "first repository walkthrough");
}

console.log("Docs QA passed.");
