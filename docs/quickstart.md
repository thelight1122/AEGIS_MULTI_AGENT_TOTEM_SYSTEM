# AEGIS Totem Quickstart

AEGIS Totem gives a repository append-only continuity for AI-assisted development: a Root Totem, Folder Totems, and one message lane per agent, model, instance, or human.

## 1. Install The CLI

Until the first npm publication, use the repository build:

```bash
npm install
npm run build
node dist/src/cli.js --help
npm link
```

After npm publication, the target install path is:

```bash
npm install -g aegis-totem
```

If you do not want to link the development build globally, replace `aegis-totem` in the examples below with `node /absolute/path/to/aegis-totem/dist/src/cli.js`.

Before sharing the alpha with another developer, run:

```bash
npm run alpha:check
```

This validates the CLI, local install flow, MCP adapter, VS Code package, and release preflight without publishing anything.

## 2. Start A Repository

Run from the root of the repository you want to coordinate:

```bash
aegis-totem start
```

For IDEs, agents, and scripts that need a structured result:

```bash
aegis-totem start --json
```

This creates:

```text
ROOT_TOTEM.md
AGENTS.md
.aegis/config.json
.aegis/lanes/
.aegis/templates/
<branch-folder>/TOTEM.md
```

Start preserves existing `ROOT_TOTEM.md`, `AGENTS.md`, and `TOTEM.md` files. It seeds Folder Totems only for existing branch folders and lists their immediate subfolder elements while skipping generated and dependency folders such as `.git`, `.aegis`, `node_modules`, `dist`, and `coverage`.

## 3. Create Lanes For Each Participant

```bash
aegis-totem lane create codex
aegis-totem lane create claude
```

Each lane is an append-only Markdown file under `.aegis/lanes/`.

## 4. Add Folder Totems As The Repo Grows

Start seeds the existing branch folders. Later, create a Folder Totem manually for any new branch folder that was added outside the VS Code watcher:

```bash
aegis-totem totem create tests
```

Before editing a folder, read its `TOTEM.md`. After completing verified work, append the durable update.

## 5. Coordinate Without Copy/Paste

```bash
aegis-totem lane message codex --to claude -m "I am editing src/parser. Please avoid parser changes until I append the result."
```

The recipient can read the lane directly from the repository.

## 6. Append Verified Folder Knowledge

```bash
aegis-totem totem append src --actor codex --kind verified-change -m "Added parser tests. Verification: npm test passed."
```

Use Folder Totems for durable, reusable folder knowledge. Use lanes for coordination, uncertainty, handoffs, and working notes.

## 7. Inspect And Validate

```bash
aegis-totem status
aegis-totem list
aegis-totem read root
aegis-totem read lane codex
aegis-totem read folder src
aegis-totem analytics
aegis-totem validate
aegis-totem doctor
aegis-totem doctor --json
aegis-totem mcp config
```

`status`, `list`, `analytics`, `doctor`, and `mcp config` are read-only. `validate` checks the required Root Totem and append-log structure. `list` shows discovered lane files and Folder Totems. `doctor` reports readiness gaps before parallel agent work begins.

Use `aegis-totem list --lanes` or `aegis-totem list --folders` when you only need one side of the coordination surface.

Use `aegis-totem read root`, `aegis-totem read lane <name>`, and `aegis-totem read folder <path>` when you need the actual Markdown content from a terminal, script, or agent process.

For IDEs, scripts, or MCP clients that need a structured coordination snapshot:

```bash
aegis-totem analytics --json
```

The analytics view reports total appends, last activity, active and quiet lanes, active and quiet Folder Totems, and the busiest lane/folder surfaces without changing any repo files.

Use `aegis-totem start --json` when an IDE, agent, or local script needs the repository path, readiness flag, and seeded Folder Totem count. Use `aegis-totem doctor --json` when an IDE, MCP client, or local script needs structured readiness checks instead of the human-readable Doctor report.

To make validation part of local commits, install the optional Git hook:

```bash
aegis-totem hooks install
```

The hook lives at `.git/hooks/pre-commit`, runs `aegis-totem validate`, and is local to the repository.

For a step-by-step adoption path in an existing repository, see the
[first repository walkthrough](first-repo-walkthrough.md).

## 8. Use VS Code

Build and install the local VS Code extension package:

```bash
npm run vscode:qa
code --install-extension dist/aegis-totem-vscode-0.1.0.vsix
```

On Windows, do not double-click the `.vsix` file. That can open the Visual Studio VSIX Installer, which cannot install VS Code extensions. In VS Code, use `Extensions` -> `...` -> `Install from VSIX...`, or run the `code --install-extension` command above.

Open any existing repository and run `AEGIS Totem: Start` from the command palette. The extension calls `aegis-totem start --json`, builds the Root Totem structure, seeds Folder Totems only for existing branch folders, lists their immediate subfolder elements, creates `AGENTS.md` when absent, and opens Doctor readiness immediately after Start. The AEGIS Totem Explorer view then shows the Root Totem, Folder Totems, and lane files. Use the command palette for:

- `AEGIS Totem: Start`
- `AEGIS: Show Status`
- `AEGIS: Show List`
- `AEGIS: Show Analytics`
- `AEGIS: Validate`
- `AEGIS: Run Doctor`
- `AEGIS: Send Lane Message`
- `AEGIS: Append Folder Update`

## 9. Use MCP Clients

Build the server and point your MCP client at `dist/src/mcp-server.js` with
`AEGIS_REPO_ROOT` set to the repository you want agents to coordinate.

See [MCP client examples](mcp-clients.md) for Codex, Claude Desktop, and other
stdio MCP client configuration shapes.

To print copyable MCP JSON for the current repository:

```bash
aegis-totem mcp config
```

## Suggested Agent Loop

1. Read `ROOT_TOTEM.md`.
2. Read the relevant folder's `TOTEM.md`.
3. Read your lane and any addressed messages.
4. Announce your intended work in your lane.
5. Work in the folder.
6. Run verification.
7. Append durable facts to the Folder Totem.
8. Send any handoff or collision warning through lanes.

## Collision Scenario

Without AEGIS Totem, two agents may edit the same folder without seeing each other's intent.

With AEGIS Totem:

```bash
aegis-totem lane message codex --to claude -m "Working in src/core/status.ts. I will append when tests pass."
aegis-totem lane message claude --to codex -m "Acknowledged. I will stay in docs until your append lands."
```

The coordination record stays with the repository and does not depend on a human copy/paste bridge.
