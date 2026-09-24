import { describe, expect, it } from "vitest";
import { buildMcpConfig } from "../src/core/mcp-config.js";

describe("MCP config", () => {
  it("prints a stdio mcpServers object with normalized JSON paths", () => {
    const config = JSON.parse(buildMcpConfig({
      repoRoot: "G:\\my-project",
      serverPath: "G:\\AEGIS_MULTI_AGENT_TOTEM_SYSTEM\\dist\\src\\mcp-server.js"
    }));

    expect(config).toEqual({
      mcpServers: {
        "aegis-totem": {
          command: "node",
          args: ["G:/AEGIS_MULTI_AGENT_TOTEM_SYSTEM/dist/src/mcp-server.js"],
          env: {
            AEGIS_REPO_ROOT: "G:/my-project"
          }
        }
      }
    });
  });

  it("supports a custom server name", () => {
    const config = JSON.parse(buildMcpConfig({
      repoRoot: "/work/project",
      serverPath: "/tools/aegis/dist/src/mcp-server.js",
      serverName: "aegis-project"
    }));

    expect(config.mcpServers["aegis-project"].env.AEGIS_REPO_ROOT).toBe("/work/project");
  });
});
