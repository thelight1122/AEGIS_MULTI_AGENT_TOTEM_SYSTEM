# AEGIS Totem for VS Code

This first extension surface exposes the repository's Root Totem, common Folder Totems, and the Codex lane in the Explorer. It invokes the installed `aegis-totem` CLI for status and validation, so the extension does not create a second storage system.

Install the CLI first with `npm install -g aegis-totem`, then install or package this extension from the `vscode-extension` folder.

The extension is an early adapter. Folder discovery, lane selection, and append forms are planned as subsequent integration work. The MCP adapter is available from the repository root with `npm run mcp` after building.
