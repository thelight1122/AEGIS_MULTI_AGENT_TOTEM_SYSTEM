# AEGIS Totem for VS Code

This extension exposes the repository's Root Totem, all discovered Folder Totems, and agent lanes in the Explorer. It invokes the installed `aegis-totem` CLI for status, validation, lane messages, and Folder Totem updates, so the extension does not create a second storage system.

Install the CLI first with `npm install -g aegis-totem`, then install or package this extension from the `vscode-extension` folder.

The MCP adapter is available from the repository root with `npm run mcp` after building.
