# First Repository Walkthrough

Use this walkthrough to introduce AEGIS Totem into an existing repository without
changing application code.

## 1. Install Or Link The CLI

During development:

```bash
npm install
npm run build
npm link
```

After npm publication, the intended install path is:

```bash
npm install -g aegis-totem
```

## 2. Start The Target Repository

From the root of the repository you want to coordinate:

```bash
aegis-totem start
```

For local automation, IDEs, or agents that need machine-readable proof of the
Start result:

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

It does not overwrite existing `ROOT_TOTEM.md`, `AGENTS.md`, `.aegis/config.json`, or `TOTEM.md` files. It seeds Folder Totems only for existing branch folders, lists their immediate subfolder elements, and skips generated/dependency folders such as `.git`, `.aegis`, `node_modules`, `dist`, and `coverage`.

## 3. Create Lanes For Active Participants

Create one lane per human, model, agent, or instance that will coordinate in the
repository:

```bash
aegis-totem lane create codex
aegis-totem lane create claude
```

Use lanes for intent, uncertainty, handoffs, collision warnings, and direct
agent-to-agent messages.

## 4. Add Folder Totems As Needed

Start already seeds existing branch folders. If a branch folder is created later outside the VS Code watcher, add its Totem manually:

```bash
aegis-totem totem create tests
```

Folder Totems are reference surfaces. They should capture durable folder facts:
purpose, conventions, risks, verification patterns, and completed changes.

## 5. Coordinate Before Editing

Before starting work that could collide, append a lane message:

```bash
aegis-totem lane message codex --to claude -m "I am editing src/auth. Please avoid auth changes until I append the result."
```

The message stays in `.aegis/lanes/codex.md` and can be read by any local tool,
IDE adapter, or MCP client.

## 6. Append Verified Folder Knowledge

After completing work and running verification, append durable knowledge to the
relevant Folder Totem:

```bash
aegis-totem totem append src --actor codex --kind verified-change -m "Adjusted auth token refresh handling. Verification: npm test passed."
```

Do not use Folder Totems for every thought. Put working notes and open questions
in lanes; put reusable verified folder knowledge in Folder Totems.

## 7. Inspect The Current Coordination Surface

```bash
aegis-totem status
aegis-totem list
aegis-totem read root
aegis-totem read lane codex
aegis-totem read folder src
aegis-totem analytics
aegis-totem validate
aegis-totem doctor
```

`status`, `list`, `read`, `analytics`, and `doctor` are read-only. `validate` checks
required append-log structure. `list` shows discovered lane files and Folder
Totems. `doctor` summarizes readiness gaps such as missing lanes, Folder Totems,
append activity, or the optional local validation hook.

Use `aegis-totem list --lanes` to inspect participant lanes only, or
`aegis-totem list --folders` to inspect Folder Totems only.

Use `aegis-totem read root`, `aegis-totem read lane <name>`, and
`aegis-totem read folder <path>` to print the actual Markdown surface after
you discover it.

## 8. Add Optional Local Validation

To validate AEGIS structure before local commits:

```bash
aegis-totem hooks install
```

The hook is local to `.git/hooks/pre-commit` and runs `aegis-totem validate`.
It is opt-in and will not silently overwrite an existing hook.

## 9. Connect IDE Or Agent Surfaces

- VS Code: build the VSIX with `npm run package:vscode`, then install it.
- MCP clients: see [MCP client examples](mcp-clients.md).
- MCP config: run `aegis-totem mcp config` from the repository you want agents to coordinate.

All surfaces read and append the same repository files.

## Suggested First Commit

For a repo adopting AEGIS Totem, a first commit usually includes:

```text
ROOT_TOTEM.md
.aegis/config.json
.aegis/templates/
.aegis/lanes/<participant>.md
<branch-folder>/TOTEM.md
```

The optional `.git/hooks/pre-commit` file is not normally committed because Git
hooks live outside the tracked tree.
