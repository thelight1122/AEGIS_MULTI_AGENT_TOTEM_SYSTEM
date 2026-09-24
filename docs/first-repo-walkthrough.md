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

## 2. Initialize The Target Repository

From the root of the repository you want to coordinate:

```bash
aegis-totem init
```

This creates:

```text
ROOT_TOTEM.md
.aegis/config.json
.aegis/lanes/
.aegis/templates/
```

It does not overwrite an existing `ROOT_TOTEM.md` or `.aegis/config.json`.

## 3. Create Lanes For Active Participants

Create one lane per human, model, agent, or instance that will coordinate in the
repository:

```bash
aegis-totem lane create codex
aegis-totem lane create claude
```

Use lanes for intent, uncertainty, handoffs, collision warnings, and direct
agent-to-agent messages.

## 4. Create Folder Totems For High-Traffic Areas

Start with folders where agents often inspect or edit code:

```bash
aegis-totem totem create src
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
aegis-totem analytics
aegis-totem validate
aegis-totem doctor
```

`status`, `analytics`, and `doctor` are read-only. `validate` checks required
append-log structure. `doctor` summarizes readiness gaps such as missing lanes,
Folder Totems, append activity, or the optional local validation hook.

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
<folder>/TOTEM.md
```

The optional `.git/hooks/pre-commit` file is not normally committed because Git
hooks live outside the tracked tree.
