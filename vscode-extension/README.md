# AEGIS Totem for VS Code

This extension creates and seeds a repository's AEGIS Totem structure when it is absent, then exposes the Root Totem, discovered Folder Totems, and agent lanes in grouped sidebar sections. For local alpha testing, it invokes the bundled AEGIS Totem CLI runtime for Start, status, list, analytics, validation, doctor readiness, lane messages, and Folder Totem updates, so the extension does not create a second storage system.

The first step is the visible `Initialize System` row in the AEGIS Totem sidebar, or the command `AEGIS Totem: Start`. Both call the bundled AEGIS Totem CLI with `start --json`, create the Root Totem, local AEGIS configuration, assistant-facing `AGENTS.md` instructions, and Folder Totems only for existing branch folders, with immediate subfolder elements listed. They then open Doctor readiness so the first run shows whether the repository is prepared for coordinated agent work. After Start, models and developers can read the repository's Totems and append reference material, code snippets, audit requests, findings, and agent communications.

Start preserves existing `AGENTS.md`, `ROOT_TOTEM.md`, and `TOTEM.md` files. The extension also watches for new branch folders and creates a `TOTEM.md` in each branch folder, unless one already exists.

`AEGIS: Show List` opens a read-only panel with the discovered Root Totem, lane files, and Folder Totems.

`AEGIS: Show Analytics` opens a read-only panel with last activity, active and quiet lanes, active and quiet Folder Totems, busiest surfaces, and detailed lane/folder activity tables.

`AEGIS: Run Doctor` opens a read-only readiness report before parallel agent work begins.

`AEGIS: Live Test Checklist` opens a read-only panel with the active workspace, bundled CLI/runtime status, CLI version, and the manual smoke-test steps for the installed VSIX.

For local alpha testing, the VSIX bundles the AEGIS Totem CLI runtime used by the extension. Package this extension from the repository root:

```bash
npm run package:vscode
code --install-extension dist/aegis-totem-vscode-0.1.1.vsix
```

On Windows, do not double-click the `.vsix` file. That can open the Visual Studio VSIX Installer, which cannot install VS Code extensions. In VS Code, use `Extensions` -> `...` -> `Install from VSIX...`, or run the `code --install-extension` command above.

The MCP adapter is available from the repository root with `npm run mcp` after building.
