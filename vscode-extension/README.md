# AEGIS Totem for VS Code

This extension exposes the repository's Root Totem, discovered Folder Totems, and agent lanes in grouped Explorer sections. It invokes the installed `aegis-totem` CLI for status, list, analytics, validation, doctor readiness, lane messages, and Folder Totem updates, so the extension does not create a second storage system.

`AEGIS: Show List` opens a read-only panel with the discovered Root Totem, lane files, and Folder Totems.

`AEGIS: Show Analytics` opens a read-only panel with last activity, active and quiet lanes, active and quiet Folder Totems, busiest surfaces, and detailed lane/folder activity tables.

`AEGIS: Run Doctor` opens a read-only readiness report before parallel agent work begins.

Install the CLI first with `npm install -g aegis-totem`, then package this extension from the repository root:

```bash
npm run package:vscode
code --install-extension dist/aegis-totem-vscode-0.1.0.vsix
```

The MCP adapter is available from the repository root with `npm run mcp` after building.
