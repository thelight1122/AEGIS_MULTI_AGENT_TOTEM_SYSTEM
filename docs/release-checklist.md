# Release Checklist

Use this checklist before a public alpha, npm publication, or IDE marketplace publication.

## Package 1: Public Alpha Foundation

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm pack --dry-run` shows only intended npm package files.
- [ ] `npm run local-install:qa` passes.
- [ ] `npm run mcp:qa` passes.
- [ ] `npm run vscode:qa` passes and produces `dist/aegis-totem-vscode-0.1.0.vsix`.
- [ ] `npm run docs:qa` passes.
- [ ] `npm run release:preflight` passes.
- [ ] GitHub Actions CI passes on `main`.
- [ ] `README.md`, `docs/quickstart.md`, `CHANGELOG.md`, and `SECURITY.md` are current.
- [ ] `docs/first-repo-walkthrough.md` and `docs/mcp-clients.md` are current.

Shortcut:

```bash
npm run alpha:check
```

## Package 2: Local Install QA

- [ ] Run the automated local CLI install QA.
- [ ] Confirm the packed npm tarball installs into a temporary sandbox.
- [ ] Confirm the installed `aegis-totem` binary runs in a temporary repository.
- [ ] Confirm `aegis-totem init` creates the Root Totem and `.aegis` structure.
- [ ] Confirm two lanes can be created.
- [ ] Confirm at least one Folder Totem can be created.
- [ ] Confirm one lane message is appended.
- [ ] Confirm one Folder Totem update is appended.
- [ ] Confirm `aegis-totem status` reports the expected counts.
- [ ] Confirm `aegis-totem analytics` reports append activity, quiet lanes, and last activity without editing Totems or lanes.
- [ ] Confirm `aegis-totem analytics --json` returns the same read-only coordination snapshot for IDE/tooling use.
- [ ] Confirm `aegis-totem validate` passes.
- [ ] Confirm `aegis-totem doctor` passes for a prepared temporary repository.
- [ ] Confirm `aegis-totem hooks install` creates `.git/hooks/pre-commit` without overwriting existing hooks.

Shortcut:

```bash
npm run local-install:qa
```

## Package 3: Agent Integration QA

- [ ] Run the automated MCP QA.
- [ ] Confirm the MCP server starts through stdio.
- [ ] Confirm `AEGIS_REPO_ROOT` points to a temporary test repository.
- [ ] Confirm the expected MCP tools are listed.
- [ ] Confirm Root Totem can be read through MCP.
- [ ] Confirm a Folder Totem can be read through MCP.
- [ ] Confirm an agent lane can be read through MCP.
- [ ] Confirm a lane message can be sent through MCP.
- [ ] Confirm a Folder Totem update can be appended through MCP.
- [ ] Confirm status and validation run through MCP.
- [ ] Confirm analytics runs through MCP.
- [ ] Confirm `docs/mcp-clients.md` includes usable stdio client examples.
- [ ] Confirm `docs/first-repo-walkthrough.md` covers first repository adoption.

Shortcut:

```bash
npm run mcp:qa
```

## Package 4: VS Code Adapter QA

- [ ] Run the automated VS Code package QA.
- [ ] Confirm the `.vsix` contains the extension manifest, runtime file, README, and license.
- [ ] Confirm the extension manifest declares the AEGIS Explorer view.
- [ ] Confirm the extension manifest declares refresh, Root Totem, status, validation, lane-message, and Folder Totem append commands.
- [ ] Confirm the extension manifest declares the analytics command.
- [ ] Confirm `AEGIS: Show Analytics` opens a read-only panel from `aegis-totem analytics --json`.
- [ ] Confirm `AEGIS: Run Doctor` opens a read-only readiness panel from `aegis-totem doctor`.
- [ ] Install the VS Code `.vsix`.
- [ ] Open a temporary repository in VS Code.
- [ ] Confirm Root Totem, Folder Totem, and lanes appear in the AEGIS Totem view.
- [ ] Confirm VS Code lane-message and Folder Totem append commands work.

Shortcut:

```bash
npm run vscode:qa
```

## Package 5: Publication Gates

- [ ] Run the automated release preflight.
- [ ] Confirm npm package name and ownership.
- [ ] Re-check whether `aegis-totem` exists in the npm registry immediately before publication.
- [ ] Re-check whether `v0.1.0-alpha.1` exists as a GitHub Release immediately before publication.
- [ ] Review `docs/releases/v0.1.0-alpha.1.md`.
- [ ] Publish npm only after explicit authorization.
- [ ] Create a GitHub Release with release notes.
- [ ] Attach the generated `.vsix` if using GitHub Releases for alpha distribution.
- [ ] Publish to VS Code Marketplace or Open VSX only after explicit authorization.

Shortcut:

```bash
npm run release:preflight
```

## Package 6: Post-Alpha Improvements

- [x] Improve VS Code command prompts and error messages.
- [x] Add richer tree grouping for Root Totem, Folder Totems, and lanes.
- [x] Add VS Code Analytics panel for append activity and quiet lanes.
- [x] Add VS Code Doctor panel for first-repo readiness.
- [ ] Re-run `npm run vscode:qa`.
- [ ] Re-run `npm run alpha:check`.
- [x] Add more MCP client examples.
- [ ] Add JetBrains or other IDE adapters if demand appears.
- [x] Add optional analytics over append logs without changing append-only storage.
- [x] Add optional local Git hook installation for validation.
- [x] Add read-only adoption doctor for first-repo readiness.
