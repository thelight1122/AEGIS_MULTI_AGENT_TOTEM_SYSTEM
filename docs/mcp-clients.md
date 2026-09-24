# MCP Client Examples

AEGIS Totem includes a local MCP server so AI coding agents can read and append
the same repo-native Totems and lanes as the CLI and VS Code adapter.

The MCP server is stateless. The repository files remain the source of truth.

## Build The Server

From this repository:

```bash
npm install
npm run build
```

The server entry point is:

```text
dist/src/mcp-server.js
```

## Required Environment

Set `AEGIS_REPO_ROOT` to the repository the agent should coordinate.

Use an absolute path. Examples:

```text
G:\my-project
/Users/tracey/my-project
```

## Codex Or Other Local MCP Clients

Use this shape in any MCP client that supports stdio servers:

```json
{
  "mcpServers": {
    "aegis-totem": {
      "command": "node",
      "args": ["G:/AEGIS_MULTI_AGENT_TOTEM_SYSTEM/dist/src/mcp-server.js"],
      "env": {
        "AEGIS_REPO_ROOT": "G:/my-project"
      }
    }
  }
}
```

On Windows, forward slashes in JSON paths avoid escaping mistakes. Backslashes
also work when escaped as `\\`.

## Claude Desktop Shape

Claude Desktop uses the same stdio server shape in its MCP configuration:

```json
{
  "mcpServers": {
    "aegis-totem": {
      "command": "node",
      "args": ["G:/AEGIS_MULTI_AGENT_TOTEM_SYSTEM/dist/src/mcp-server.js"],
      "env": {
        "AEGIS_REPO_ROOT": "G:/my-project"
      }
    }
  }
}
```

Restart the client after changing MCP configuration.

## Exposed Tools

The server exposes:

- `aegis_read_root_totem`
- `aegis_read_folder_totem`
- `aegis_read_lane`
- `aegis_send_lane_message`
- `aegis_append_folder_update`
- `aegis_status`
- `aegis_analytics`
- `aegis_validate`

## Suggested Agent Loop

1. Call `aegis_read_root_totem`.
2. Call `aegis_read_folder_totem` for the folder you will inspect or edit.
3. Call `aegis_read_lane` for your lane.
4. Use `aegis_send_lane_message` before starting work that could collide.
5. Work in the repository.
6. Run the repository's normal verification.
7. Use `aegis_append_folder_update` only for durable, verified folder knowledge.
8. Use `aegis_status`, `aegis_analytics`, and `aegis_validate` before handoff.

## Boundaries

The MCP adapter does not publish packages, create GitHub releases, install VSIX
artifacts, mutate trust settings, or replace Git commits. It only reads and
appends the local AEGIS Totem files under the configured repository root.
