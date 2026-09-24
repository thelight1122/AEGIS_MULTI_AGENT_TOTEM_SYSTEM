export type McpConfigOptions = {
  repoRoot: string;
  serverPath: string;
  serverName?: string;
};

export function buildMcpConfig(options: McpConfigOptions): string {
  const serverName = options.serverName ?? "aegis-totem";

  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: "node",
        args: [normalizeJsonPath(options.serverPath)],
        env: {
          AEGIS_REPO_ROOT: normalizeJsonPath(options.repoRoot)
        }
      }
    }
  }, null, 2);
}

function normalizeJsonPath(path: string): string {
  return path.replaceAll("\\", "/");
}
