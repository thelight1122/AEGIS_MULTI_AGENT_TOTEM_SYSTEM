# Release Checklist

Use this checklist before a public alpha, npm publication, or IDE marketplace publication.

## Package 1: Public Alpha Foundation

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm pack --dry-run` shows only intended npm package files.
- [ ] `npm run package:vscode` produces `dist/aegis-totem-vscode-0.1.0.vsix`.
- [ ] GitHub Actions CI passes on `main`.
- [ ] `README.md`, `docs/quickstart.md`, `CHANGELOG.md`, and `SECURITY.md` are current.

Shortcut:

```bash
npm run alpha:check
```

## Package 2: Local Install QA

- [ ] Install the CLI locally or globally.
- [ ] Create a temporary repository.
- [ ] Run `aegis-totem init`.
- [ ] Create two lanes.
- [ ] Create at least one Folder Totem.
- [ ] Append one lane message.
- [ ] Append one Folder Totem update.
- [ ] Run `aegis-totem status`.
- [ ] Run `aegis-totem validate`.
- [ ] Install the VS Code `.vsix`.
- [ ] Open the temporary repository in VS Code.
- [ ] Confirm Root Totem, Folder Totem, and lanes appear in the AEGIS Totem view.
- [ ] Confirm VS Code lane-message and Folder Totem append commands work.

## Package 3: Agent Integration QA

- [ ] Build the repo.
- [ ] Configure an MCP client to run `dist/src/mcp-server.js`.
- [ ] Set `AEGIS_REPO_ROOT` to a test repository.
- [ ] Read Root Totem through MCP.
- [ ] Read a Folder Totem through MCP.
- [ ] Read an agent lane through MCP.
- [ ] Send a lane message through MCP.
- [ ] Append a Folder Totem update through MCP.
- [ ] Run status and validation through MCP.

## Package 4: Publication Gates

- [ ] Confirm npm package name and ownership.
- [ ] Publish npm only after explicit authorization.
- [ ] Create a GitHub Release with release notes.
- [ ] Attach the generated `.vsix` if using GitHub Releases for alpha distribution.
- [ ] Publish to VS Code Marketplace or Open VSX only after explicit authorization.

## Package 5: Post-Alpha Improvements

- [ ] Improve VS Code command prompts and error messages.
- [ ] Add richer tree grouping for Root Totem, Folder Totems, and lanes.
- [ ] Add more MCP client examples.
- [ ] Add JetBrains or other IDE adapters if demand appears.
- [ ] Add optional analytics over append logs without changing append-only storage.
