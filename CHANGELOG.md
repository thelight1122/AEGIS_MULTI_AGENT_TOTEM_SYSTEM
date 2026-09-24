# Changelog

## 0.1.0-alpha.1 - Unreleased

Public alpha foundation for AEGIS Totem.

### Added

- TypeScript CLI with `init`, agent lanes, lane messages, Folder Totems, append-only folder updates, `status`, `list`, and `validate`.
- Read-only `list` command for discovered lanes and Folder Totems, with lane-only and Folder-Totem-only filters.
- Read-only `read` commands for Root Totem, agent lanes, and Folder Totems.
- Read-only `doctor` command for first-repository readiness checks before parallel agent work, including JSON output for IDE/tooling use.
- Read-only analytics for append activity, last activity, active/quiet lanes, active/quiet Folder Totems, busiest surfaces, and JSON output for IDE/tooling use.
- Optional local pre-commit hook installation for Totem validation.
- MCP client examples for Codex, Cursor, Claude Desktop, Cline, Windsurf, and other stdio clients.
- Read-only `mcp config` command for printing copyable stdio MCP client JSON.
- First repository walkthrough for introducing AEGIS Totem into an existing project.
- Append-only write helper with lock-directory serialization for concurrent agent writes.
- MCP stdio adapter exposing Root Totem, Folder Totem, lane, append, status, list, analytics, validation, and doctor tools.
- VS Code adapter for browsing Totems and lanes, viewing read-only List, Analytics, and structured Doctor panels, sending lane messages, and appending Folder Totem updates.
- Local VS Code `.vsix` packaging with `npm run package:vscode`.
- Local install QA, MCP QA, VS Code package QA, and release preflight checks.
- CI workflow for tests, typecheck, build, npm pack dry-run, install QA, MCP QA, VS Code QA, and release preflight.

### Notes

- The CLI, MCP server, and VS Code adapter all use repo-native Markdown files as the canonical storage surface.
- No hosted service, account, telemetry, or external database is required.
- Marketplace, Open VSX, and npm publication are separate release gates and are not performed by the build itself.
