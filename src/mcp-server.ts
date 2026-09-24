import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { appendLaneMessage } from "./core/lanes.js";
import { appendFolderTotem } from "./core/totems.js";
import { formatStatus, getStatus } from "./core/status.js";
import { formatValidation, validateRepo } from "./core/validate.js";
import { formatAnalytics, getAnalytics } from "./core/analytics.js";
import { formatDoctor, runDoctor } from "./core/doctor.js";
import { ensureInsideRoot } from "./fs/repo.js";
import { sanitizeLaneName } from "./core/schema.js";

const repoRoot = resolve(process.env.AEGIS_REPO_ROOT ?? process.cwd());
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const server = new McpServer({ name: "aegis-totem", version: "0.1.0" });

server.tool("aegis_read_root_totem", "Read the repository Root Totem.", {}, async () => text(await readFile(join(repoRoot, "ROOT_TOTEM.md"), "utf8")));
server.tool("aegis_read_folder_totem", "Read a Folder Totem by repository-relative folder path.", { folder: z.string() }, async ({ folder }) => text(await readFile(join(ensureInsideRoot(repoRoot, join(repoRoot, folder)), "TOTEM.md"), "utf8")));
server.tool("aegis_read_lane", "Read an append-only agent lane.", { lane: z.string() }, async ({ lane }) => text(await readFile(join(repoRoot, ".aegis", "lanes", `${sanitizeLaneName(lane)}.md`), "utf8")));
server.tool("aegis_send_lane_message", "Append a message to an agent lane.", { lane: z.string(), message: z.string(), to: z.string().optional() }, async ({ lane, message, to }) => text(await appendLaneMessage(repoRoot, lane, message, to)));
server.tool("aegis_append_folder_update", "Append a durable update to a Folder Totem.", { folder: z.string(), actor: z.string(), kind: z.string(), message: z.string() }, async ({ folder, actor, kind, message }) => text(await appendFolderTotem(repoRoot, folder, actor, kind, message)));
server.tool("aegis_status", "Show the current read-only AEGIS Totem inventory.", {}, async () => text(formatStatus(await getStatus(repoRoot))));
server.tool("aegis_analytics", "Show read-only append activity counts for Totems and lanes.", {}, async () => text(formatAnalytics(await getAnalytics(repoRoot))));
server.tool("aegis_validate", "Validate AEGIS Totem structure and append logs.", {}, async () => text(formatValidation(await validateRepo(repoRoot))));
server.tool("aegis_doctor", "Run a read-only readiness check for AEGIS Totem coordination.", {}, async () => text(formatDoctor(await runDoctor(repoRoot))));
await server.connect(new StdioServerTransport());
