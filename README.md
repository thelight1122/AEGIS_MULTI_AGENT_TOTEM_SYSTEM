# AEGIS Totem

Append-only repo memory and collision-resistant coordination for AI coding agents.

AEGIS Totem gives a repository a shared Root Totem, Folder Totems for local reference, and separate append-only lanes for agents, models, instances, and humans. The records stay in the repository as readable Markdown, so every tool can work from the same continuity surface.

## Why It Exists

Multiple coding agents can lose context, duplicate work, or collide in shared files. AEGIS Totem gives each participant a lane for messages and working notes while preserving durable folder knowledge in Totems. In our workflow, this removed the need to copy/paste messages between parallel desktop coding models and eliminated observed collisions.

The tool is free, local-first, and has no account, hosted service, or telemetry requirement.

## Install

The package is being prepared for its first npm release. During development, clone the repository and run:

```bash
npm install
npm run build
node dist/src/cli.js --help
```

## Quick Start

Run these commands from the root of a repository:

```bash
aegis-totem init
aegis-totem lane create codex
aegis-totem lane create claude
aegis-totem totem create src
aegis-totem lane message codex --to claude -m "I inspected src. Please review the parser boundary before editing."
aegis-totem totem append src --actor codex --kind verified-change -m "Added parser tests. Verification: npm test passed."
aegis-totem status
aegis-totem analytics
aegis-totem validate
aegis-totem doctor
aegis-totem hooks install
```

## Generated Structure

```text
ROOT_TOTEM.md                 repo-wide orientation and append log
.aegis/config.json            local configuration
.aegis/lanes/<agent>.md       one append-only lane per participant
<folder>/TOTEM.md             folder reference and durable append log
```

Read the relevant Totem before editing a folder. Use a lane for coordination, uncertainty, handoffs, and direct model-to-model messages. Append verified updates after work. Corrections and supersessions are appended as new records; historical entries are not silently rewritten or deleted.

## Commands

| Command | Purpose |
| --- | --- |
| `init` | Create the local AEGIS structure without overwriting existing Totems. |
| `lane create <name>` | Create an agent lane. |
| `lane message <lane> -m <text>` | Append a message, optionally addressed with `--to <lane>`. |
| `totem create <folder>` | Create a Folder Totem. |
| `totem append <folder>` | Append a durable update with `--actor`, `--kind`, and `--message`. |
| `status` | Show a read-only inventory. |
| `analytics` | Show read-only append activity counts, last activity, active/quiet lanes, and busiest Totem surfaces. |
| `validate` | Check required Totem and append-log structure. |
| `doctor` | Run a read-only readiness check before parallel agent work. |
| `hooks install` | Install an optional local pre-commit hook that runs validation. |

## Development

```bash
npm test
npm run typecheck
npm run build
npm run local-install:qa
npm run mcp:qa
npm run vscode:qa
npm run docs:qa
npm run release:preflight
npm run alpha:check
```

The first release is intentionally a local CLI. VS Code, MCP, JetBrains, and other IDE integrations will build on the same CLI and repository artifacts rather than creating a second source of truth.

`aegis-totem analytics --json` returns the same read-only coordination snapshot as structured JSON for IDEs, MCP clients, and local automation.

## VS Code

The first extension adapter lives in `vscode-extension`. It adds an AEGIS Totem view to the Explorer, groups the Root Totem, Folder Totems, and agent lanes, opens analytics and doctor readiness in read-only panels, and invokes the CLI for status, validation, lane messages, and Folder Totem updates.

Build an installable VS Code package locally:

```bash
npm run package:vscode
code --install-extension dist/aegis-totem-vscode-0.1.0.vsix
```

Install the CLI first so the extension can call `aegis-totem` from opened repositories.

To verify the packaged extension before sharing it, run:

```bash
npm run vscode:qa
```

The QA packages the extension, inspects the `.vsix`, confirms required files are present, and verifies the expected AEGIS commands, Analytics/Doctor panel wiring, and Explorer view are declared.

## MCP

The local MCP adapter exposes the same canonical repo surface to AI coding agents. Set `AEGIS_REPO_ROOT` to the repository path and run `npm run build`, then configure the MCP client to launch:

```json
{
  "mcpServers": {
    "aegis-totem": {
      "command": "node",
      "args": ["/absolute/path/to/aegis-totem/dist/src/mcp-server.js"],
      "env": { "AEGIS_REPO_ROOT": "/absolute/path/to/your/repo" }
    }
  }
}
```

The server provides tools to read the Root Totem, read Folder Totems and lanes, send lane messages, append Folder Totem updates, show status, show analytics, validate structure, and run the readiness doctor. It is local and stateless; the repository files remain authoritative.

See [MCP client examples](docs/mcp-clients.md) for Codex, Cursor, Claude Desktop, Cline, Windsurf, and other stdio MCP client configuration shapes.

## Project Records

- [Root Totem](ROOT_TOTEM.md)
- [Quickstart](docs/quickstart.md)
- [First repository walkthrough](docs/first-repo-walkthrough.md)
- [MCP client examples](docs/mcp-clients.md)
- [Release checklist](docs/release-checklist.md)
- [Draft release notes](docs/releases/v0.1.0-alpha.1.md)
- [Changelog](CHANGELOG.md)
- [Security policy](SECURITY.md)
- [MVP implementation plan](docs/superpowers/plans/2026-09-23-aegis-totem-mvp.md)
- [Flow, Locus, and Axiom evolution note](docs/evolution/2026-09-23-flow-locus-axiom-progression.md)

## License

MIT. See [LICENSE](LICENSE).
