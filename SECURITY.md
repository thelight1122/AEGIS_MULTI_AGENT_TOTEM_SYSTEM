# Security Policy

AEGIS Totem is local-first. The CLI, MCP adapter, and VS Code adapter operate on files in the repository opened by the developer.

## Current Scope

- No hosted service is required.
- No account is required.
- No telemetry is collected by the tool.
- Append-only records are written to local repository files.
- The MCP server is a local stdio adapter over those files.

## Reporting Issues

For now, report security concerns through GitHub issues on the public repository:

https://github.com/thelight1122/AEGIS_MULTI_AGENT_TOTEM_SYSTEM/issues

Do not include secrets, private repository contents, tokens, or sensitive customer data in public reports.

## Dependency Notes

The project currently depends on Node packages for CLI parsing, schema validation, tests, TypeScript, MCP, and VS Code packaging. Dependency updates should be reviewed intentionally. Do not use forced dependency remediation when it would silently introduce breaking changes.
