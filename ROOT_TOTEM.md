# AEGIS Root Totem

Created: 2026-09-23
Repo: AEGIS_MULTI_AGENT_TOTEM_SYSTEM

## Purpose

This repository exists to build the free AEGIS Totem developer tool.

AEGIS Totem is a repo-native, append-only continuity system for AI-assisted development. It gives a repository shared reference memory through Root and Folder Totems, and it gives each human, agent, model, or instance its own message lane so parallel work can coordinate without collisions.

## Core Product Thesis

AI coding agents lose context, duplicate work, collide in shared state, and often require a human to copy/paste messages between tools.

AEGIS Totem addresses that by making repo coordination local, visible, append-only, and folder-aware:

- Root Totem: repo-wide orientation, status, rules, and current public direction.
- Folder Totem: local folder reference, ownership, risks, conventions, and durable updates.
- Agent Lane: append-only working/message channel for one agent, model, instance, or human.
- Distillation: durable verified updates move from lanes into shared Totems.
- Append-only provenance: corrections, supersessions, and status changes are appended, not silently rewritten.

## Operating Rules

- Read this Root Totem before working in this repository.
- Read the relevant Folder Totem before editing files in a folder once Folder Totems exist.
- Use an agent lane for working notes, uncertainty, handoffs, and model-to-model messages once lane support exists.
- Append durable verified updates to the relevant Totem after work.
- Do not rewrite or delete historical Totem or lane entries.
- Corrections are appended as corrections.
- Superseded decisions are appended as supersessions.
- Current-state summaries may be generated as views, but the durable record remains append-only.

## Current Repo State

Status: Planning and initial self-dogfooding.

Known current facts:

- The workspace path is `G:\AEGIS_MULTI_AGENT_TOTEM_SYSTEM`.
- This workspace was not a Git repository at the time the MVP plan was written.
- The first detailed build plan exists at `docs/superpowers/plans/2026-09-23-aegis-totem-mvp.md`.
- The planned MVP is a TypeScript Node CLI.
- The planned storage surface is local Markdown plus JSON config.
- The planned first commands are `init`, `lane create`, `lane message`, `totem create`, `totem append`, `status`, and `validate`.
- VS Code extension, MCP server, hooks, and richer analytics are future work, not MVP.

Known shortfalls:

- Git has not yet been initialized in this workspace.
- The CLI has not yet been implemented.
- Folder Totems and Agent Lanes do not exist yet.
- Validation behavior exists only in the implementation plan.

## Public Positioning

Working headline:

> AEGIS Totem: append-only repo memory and collision-free coordination for AI coding agents.

Plain-language launch posture:

> We built AEGIS Totems because multiple AI coding agents working in one repo kept colliding, losing context, and forcing us to copy/paste between tools. Folder Totems and append-only Agent Lanes eliminated those collisions in our workflow, so we are releasing the system free for other developers.

## MVP Build Direction

First build target:

- Free and local-first.
- Installable as an npm CLI.
- No hosted service.
- No account requirement.
- No telemetry in MVP.
- MIT license unless changed by explicit decision.
- Human-readable Markdown artifacts.
- Append-only writes as the integrity law.

First success condition:

The repo can dogfood AEGIS Totem inside itself: initialize Totem structure, create lanes, create Folder Totems, append messages, append durable folder updates, show read-only status, and validate structure.

## Append Log

### 2026-09-24 | codex-lumin | structured-doctor-diagnostics

Implemented the next local build group: structured Doctor diagnostics for IDE/tooling use.

Evidence:

- Added `aegis-totem doctor --json` while preserving the existing human-readable `doctor` output.
- Updated the VS Code Doctor panel to read structured Doctor JSON and render readiness summary cards plus a checks table.
- Updated local install QA, VS Code QA, docs QA, README, quickstart, changelog, release checklist, draft alpha release notes, and this Root Totem.

Distilled understanding:

- Doctor readiness should be both human-readable and machine-readable.
- The IDE adapter should render canonical CLI data instead of parsing prose, keeping the CLI and repo files as the source of truth.

### 2026-09-24 | codex-lumin | filtered-list-discovery

Added focused filters to the read-only list surface.

Evidence:

- Added `aegis-totem list --lanes` and `aegis-totem list --folders`.
- Added optional `lanes` and `folders` filters to the MCP `aegis_list` tool.
- Updated focused status tests, local install QA, MCP QA, docs QA, README, quickstart, first-repo walkthrough, MCP client examples, release checklist, changelog, release notes, and this Root Totem.

Distilled understanding:

- Discovery becomes more useful when agents can ask for only lanes or only Folder Totems before deciding what to inspect.
- Filtered discovery stays read-only and does not create a second inventory model.

### 2026-09-24 | codex-lumin | vscode-list-panel

Extended the read-only list surface into the VS Code adapter.

Evidence:

- Added `AEGIS: Show List` to the VS Code extension manifest.
- Added a read-only VS Code List webview backed by `aegis-totem list --json`.
- Updated VS Code QA so packaged extension checks require the List command and panel wiring.
- Updated extension README, main README, quickstart, release checklist, changelog, release notes, docs QA, and this Root Totem.

Distilled understanding:

- Discovery should be equally available in shell, MCP, and IDE surfaces.
- The VS Code adapter remains a CLI-backed read-only view for inventory; it does not create a second state model.

### 2026-09-24 | codex-lumin | read-only-list-command

Added a read-only inventory list surface for developers and MCP agents.

Evidence:

- Added `aegis-totem list` with human-readable and `--json` output.
- Added `aegis_list` to the MCP server.
- Updated status tests, local install QA, MCP QA, docs QA, README, quickstart, first-repo walkthrough, MCP client examples, release checklist, changelog, release notes, and this Root Totem.

Distilled understanding:

- Counts are not enough for handoff; developers and agents need to see the actual lane files and Folder Totems before choosing what to read.
- The list surface remains read-only and reuses the existing repository inventory model.

### 2026-09-24 | codex-lumin | mcp-config-generator

Added a read-only MCP configuration generator for first-use setup.

Evidence:

- Added `aegis-totem mcp config` to print copyable stdio MCP JSON.
- Added `src/core/mcp-config.ts` and focused tests for default and custom server names.
- Updated local install QA so the packed CLI must print MCP config for the prepared repository.
- Updated README, quickstart, MCP client examples, first-repo walkthrough, release checklist, changelog, release notes, docs QA, and this Root Totem.

Distilled understanding:

- MCP adoption should not require users to hand-assemble JSON from prose when the CLI can print the stable config shape.
- The generator stays read-only and does not mutate IDE settings or client files.

### 2026-09-24 | codex-lumin | expanded-mcp-client-examples

Expanded the MCP adoption documentation for more coding clients.

Evidence:

- Added Cursor, Cline, and Windsurf stdio configuration shapes to `docs/mcp-clients.md`.
- Added a terminal smoke-test section for checking the MCP server before troubleshooting an IDE client.
- Updated docs QA so the new MCP client sections are required.
- Refreshed README, changelog, release checklist, and draft alpha release notes so the documented alpha surface matches CLI, MCP, analytics, doctor, and VS Code capabilities.

Distilled understanding:

- MCP adoption improves when setup examples cover the clients developers already use.
- Client-specific documentation should stay conservative because exact settings locations can drift; the stable contract is the stdio `mcpServers` shape plus `AEGIS_REPO_ROOT`.

### 2026-09-24 | codex-lumin | vscode-doctor-panel

Extended the doctor readiness package into the VS Code adapter.

Evidence:

- Added `AEGIS: Run Doctor` to the VS Code extension manifest.
- Added a read-only VS Code Doctor webview panel backed by `aegis-totem doctor`.
- Updated VS Code QA so packaged extension checks require the Doctor command and panel wiring.
- Updated README, quickstart, release checklist, extension README, changelog, and this Root Totem.

Distilled understanding:

- Readiness needs to be visible in the IDE as well as the shell and MCP.
- VS Code remains a CLI-backed view layer; doctor does not mutate repo structure or repair gaps.

### 2026-09-24 | codex-lumin | mcp-doctor-tool

Extended the adoption doctor package into the MCP adapter.

Evidence:

- Added `aegis_doctor` as a read-only MCP tool backed by the same `runDoctor` core used by the CLI.
- Updated MCP QA to create a prepared temporary repo, install the optional local validation hook, confirm `aegis_doctor` is listed, and verify the tool returns a passing doctor report.
- Updated MCP client docs and docs QA so the exposed-tool list includes `aegis_doctor`.
- Updated the changelog adapter description to include analytics, validation, and doctor coverage.

Distilled understanding:

- Agent clients need the same readiness answer as shell users.
- The MCP adapter should continue to expose one canonical repo surface, not a second readiness model.

### 2026-09-24 | codex-lumin | adoption-doctor-command

Implemented the next adoption-friction package: a read-only readiness doctor.

Evidence:

- Added `aegis-totem doctor` to check Root Totem presence, structure validation, agent lanes, Folder Totems, append activity, and optional local validation hook status.
- Added focused doctor tests for an incomplete repo and a prepared repo.
- Updated local install QA so the packaged CLI must pass `doctor` in a prepared temporary repository.
- Updated README, quickstart, first-repo walkthrough, release checklist, changelog, and docs QA coverage.

Distilled understanding:

- Developers need a simple readiness answer before starting parallel agent work.
- The doctor command should remain read-only and advisory; it names gaps without silently creating structure or changing trust boundaries.

### 2026-09-24 | codex-lumin | vscode-analytics-panel

Implemented the next IDE usability package: a read-only VS Code Analytics panel.

Evidence:

- Updated `AEGIS: Show Analytics` to call `aegis-totem analytics --json`.
- Added a VS Code webview panel that shows total entries, last activity, active/quiet lanes, active/quiet Folder Totems, busiest surfaces, and detailed lane/folder tables.
- Kept the extension as a CLI-backed view layer; it does not introduce a second storage system.
- Updated VS Code QA source checks, README, extension README, release checklist, and changelog.

Distilled understanding:

- The IDE should make coordination pressure visible where developers already work.
- A panel is a better fit than a popup once analytics includes structured totals and per-lane/per-folder activity.

### 2026-09-24 | codex-lumin | richer-read-only-analytics

Implemented the next post-alpha build package: richer read-only analytics for coordination health.

Evidence:

- Extended `aegis-totem analytics` to report last activity, active/quiet lanes, active/quiet Folder Totems, busiest lane/folder surfaces, and detailed lane/folder activity records.
- Added `aegis-totem analytics --json` for IDEs, MCP clients, and local automation that need structured output.
- Updated local install QA to verify the packaged CLI exposes the richer human-readable analytics and JSON snapshot.
- Updated README, quickstart, release checklist, changelog, and docs QA coverage.

Distilled understanding:

- Append-only continuity becomes more useful when developers can see coordination pressure without editing the records.
- Analytics should remain a read-only lens over repo-native Markdown, never a second source of truth.

### 2026-09-23 | codex-lumin | first-repo-walkthrough-package

Implemented the next onboarding package: first repository walkthrough.

Evidence:

- Added `docs/first-repo-walkthrough.md`.
- Documented first-use flow for initialization, lanes, Folder Totems, coordination messages, verified folder appends, inspection, validation hooks, and IDE/MCP surfaces.
- Extended `scripts/docs-qa.mjs` so docs QA checks the walkthrough.
- Updated README, quickstart, changelog, release checklist, and this Root Totem.

Distilled understanding:

- Public alpha onboarding needs a concrete first-repo path, not just command reference.
- The strongest first experience teaches where to put working notes, where to put durable folder knowledge, and which artifacts normally belong in the first commit.

### 2026-09-23 | codex-lumin | mcp-client-examples-package

Implemented the next post-alpha documentation package: MCP client examples.

Evidence:

- Added `docs/mcp-clients.md` with stdio MCP configuration examples.
- Documented required `AEGIS_REPO_ROOT` usage and exposed MCP tools.
- Added a suggested agent loop for MCP clients.
- Added `scripts/docs-qa.mjs` and `npm run docs:qa`.
- Added docs QA to `npm run alpha:check`.
- Updated README, quickstart, changelog, release checklist, and this Root Totem.

Distilled understanding:

- MCP adoption needs copyable client configuration, not only server implementation.
- Docs that define integration contracts need QA so examples do not drift from the adapter surface.

### 2026-09-23 | codex-lumin | opt-in-validation-hooks-package

Implemented the next local build stage: optional Git pre-commit validation hooks.

Evidence:

- Added `aegis-totem hooks install`.
- The command writes `.git/hooks/pre-commit` as a local-only hook that runs `aegis-totem validate`.
- The installer uses non-overwrite behavior so existing hooks are not silently replaced.
- Added focused hook tests and local install QA coverage.
- Updated README, quickstart, changelog, and release checklist.
- `npm run alpha:check` passes with 17 tests and all package, MCP, VS Code, and release preflight checks.

Distilled understanding:

- Hook support should be opt-in and local because Git hooks mutate developer workflow.
- Validation hooks extend continuity discipline without changing repo storage, remote state, or publication posture.

### 2026-09-23 | codex-lumin | read-only-analytics-package

Implemented the next post-alpha improvement: read-only analytics over append activity.

Evidence:

- Added `aegis-totem analytics` to report Root append entries, lane counts, lane message entries, Folder Totem counts, Folder Totem append entries, and busiest lane/folder surfaces.
- Exposed analytics through the MCP adapter as `aegis_analytics`.
- Exposed analytics through the VS Code adapter as `AEGIS: Show Analytics`.
- Updated README, quickstart, release checklist, local install QA, MCP QA, and VS Code QA.
- `npm run alpha:check` passes with 16 tests and all package, MCP, VS Code, and release preflight checks.

Distilled understanding:

- Analytics should remain a read-only view over append-only records, not a second state system.
- Developers need quick visibility into coordination activity without weakening the append-only law.

### 2026-09-23 | codex-lumin | vscode-post-alpha-usability

Implemented the first Package 6 post-alpha improvement for the VS Code adapter.

Evidence:

- Grouped the VS Code Explorer view into Root, Folder Totems, and Agent Lanes sections.
- Added safer Root Totem opening when no workspace or Root Totem exists.
- Added clearer prompt placeholders for lane messages and Folder Totem updates.
- Added success messages after append commands.
- Updated VS Code QA to verify grouped view source markers and prompt placeholders.

Distilled understanding:

- The IDE adapter should make the Totem structure legible at a glance while keeping all writes routed through the canonical CLI.

### 2026-09-23 | codex-lumin | publication-gates-package

Implemented Package 5: Publication Gates preparation.

Evidence:

- Added `scripts/release-preflight.mjs` to verify release metadata, expected npm package boundaries, built CLI/MCP outputs, generated VSIX artifact, release notes, and required scripts.
- Added `npm run release:preflight`.
- Updated `alpha:check` and CI so release preflight runs after CLI, MCP, and VS Code QA.
- Added draft release notes at `docs/releases/v0.1.0-alpha.1.md`.
- Updated README, quickstart, changelog, and release checklist with publication gate guidance.
- Preflight observations on 2026-09-23: npm returned `E404` for `aegis-totem`; GitHub reported `v0.1.0-alpha.1` release not found.

Distilled understanding:

- Publication readiness is not the same as publication.
- npm publishing, GitHub Release creation, VSIX attachment, and marketplace publication remain separate explicit authorization gates.

### 2026-09-23 | codex-lumin | vscode-adapter-qa-package

Implemented Package 4: VS Code Adapter QA.

Evidence:

- Added `scripts/vscode-qa.mjs` to verify the packaged `.vsix` contains the manifest, runtime file, README, and license.
- Added `npm run vscode:qa`.
- Updated `alpha:check` so the public alpha check now covers VS Code packaging QA instead of only packaging.
- Updated README, quickstart, and release checklist with VS Code installation and QA guidance.

Distilled understanding:

- IDE readiness needs a repeatable artifact inspection gate before marketplace or GitHub Release distribution.
- The VS Code adapter remains a thin interface over the canonical CLI and append-only repo files.

### 2026-09-23 | codex-lumin | mcp-agent-integration-qa-package

Implemented Package 3: Agent Integration QA for the MCP path.

Evidence:

- Added `scripts/mcp-qa.mjs` to launch the built MCP server over stdio against a temporary AEGIS repository.
- Added `npm run mcp:qa`.
- MCP QA verifies tool listing, Root Totem read, Folder Totem read, lane read, lane message append, Folder Totem append, status, and validation.
- Updated CI, `alpha:check`, README development commands, and the release checklist to include MCP QA.

Distilled understanding:

- Agent integration needs protocol-level proof, not only server startup.
- The MCP adapter remains stateless over repo-native files while giving agents the full read/append/status/validate loop.

### 2026-09-23 | codex-lumin | local-install-qa-package

Implemented Package 2: Local Install QA for the CLI path.

Evidence:

- Added `scripts/local-install-qa.mjs` to build, pack, install, and exercise the CLI in a temporary sandbox.
- Added `npm run local-install:qa`.
- Updated the release checklist with automated local install QA evidence and remaining manual VS Code install checks.
- Updated README development commands.

Distilled understanding:

- Local install QA should verify the built package as a user would receive it, not only the source-tree CLI.
- VS Code installation still needs a manual UI check, but the core CLI install and append workflow now has a repeatable proof path.

### 2026-09-23 | codex-lumin | public-alpha-foundation-package

Grouped remaining release work into serial packages and implemented the first package.

Evidence:

- Added GitHub Actions CI for tests, typecheck, build, npm package dry-run, and VS Code extension packaging.
- Added `npm run alpha:check` as a local public-alpha validation command.
- Added `CHANGELOG.md`, `SECURITY.md`, `docs/quickstart.md`, and `docs/release-checklist.md`.
- Updated README project records and development checks.

Distilled understanding:

- Public readiness is clearer when grouped into packages: foundation, local install QA, agent integration QA, publication gates, and post-alpha improvements.
- Package 1 creates the repeatable evidence surface needed before inviting outside developers to try AEGIS Totem.

### 2026-09-23 | codex-lumin | package-vscode-installable-slice

Advanced the VS Code adapter toward installable developer use.

Evidence:

- Fixed lane discovery so `.aegis/lanes/*.md` can appear in the AEGIS Totem Explorer view.
- Added `npm run package:vscode` to build the TypeScript CLI/MCP output and package `vscode-extension/` into `dist/aegis-totem-vscode-0.1.0.vsix`.
- Added VS Code extension repository metadata, package include boundaries, license packaging, and local install instructions.

Distilled understanding:

- The extension remains an adapter over the canonical CLI and repo-native Markdown files.
- Installability starts with a reproducible local package path before any Marketplace or Open VSX publication gate.

### 2026-09-23 | codex-lumin | expand-vscode-coordination-surface

Expanded the VS Code adapter from inspection into active coordination.

Evidence:

- Folder Totems and lane Markdown files are now discovered recursively instead of relying on fixed `src`, `tests`, and `codex` paths.
- Added `AEGIS: Send Lane Message` with lane, message, and optional recipient prompts.
- Added `AEGIS: Append Folder Update` with folder, actor, kind, and message prompts.
- Existing status, validation, Root Totem, and refresh commands remain available.
- `npm test` passes with 14 tests; typecheck, build, JavaScript syntax, and VS Code manifest checks pass.

Distilled understanding:

- The VS Code adapter is now useful for repeated coordination work, not only browsing.
- All writes still pass through the canonical CLI and append-only storage boundary, preserving cross-IDE continuity.

### 2026-09-23 | codex-lumin | add-vscode-and-mcp-adapters

Implemented the first VS Code and MCP integration surfaces.

Evidence:

- Added `vscode-extension/` with an Explorer Totem view, Root Totem opening, refresh, status, and validation commands.
- Added `src/mcp-server.ts` with tools to read the Root Totem, Folder Totems, and lanes; send lane messages; append Folder Totem updates; show status; and validate structure.
- MCP reads use repository-boundary and lane-name safety helpers before accessing files.
- Added local setup documentation for both adapters.
- `npm test` passes with 14 tests; typecheck, build, and both package-manifest JSON checks pass.
- MCP server startup was verified as a live stdio process.

Distilled understanding:

- The IDE and agent integrations are adapters over the same canonical CLI and repo files, not competing storage systems.
- VS Code currently provides discovery and inspection; MCP provides structured agent access to the complete first workflow.
- The next integration refinement is richer Folder Totem and lane discovery plus append forms in the VS Code view.

### 2026-09-23 | codex-lumin | release-hardening-and-concurrent-appends

Completed the requested release-hardening set: license and package documentation, stable CLI packaging metadata, and concurrency-safe append behavior.

Evidence:

- Added MIT `LICENSE`, public install/usage documentation, package author and keyword metadata, and npm package file boundaries.
- Added a bounded lock-directory append helper for lane and Folder Totem writes so concurrent writers serialize complete entries.
- Added a concurrent-writer test; the full suite passes with 14 tests.
- `npm run typecheck`, `npm run build`, and `npm pack --dry-run` pass.

Distilled understanding:

- AEGIS is now positioned as a small distributable CLI package while retaining human-readable repo artifacts for dogfooding.
- Append-only coordination needs a write boundary that is safe across parallel agent processes, not only a readable file format.
- The package tarball must contain the executable build and public documentation, while development tests and repo-local Totems remain outside the published package.

### 2026-09-23 | codex-lumin | implement-status-validation-dogfood

Implemented read-only visibility and structure validation, then dogfooded the complete CLI in this repository.

Evidence:

- Added `status` to report the Root Totem, Folder Totem count, and agent lane count without editing durable files.
- Added `validate` to check required Root Totem and Append Log structure.
- Added five tests for status and validation; the full suite now passes with 13 tests.
- Initialized this repository with `.aegis/config.json`, the `codex` lane, `src/TOTEM.md`, and `tests/TOTEM.md`.
- Appended a dogfood message and source-folder verification record.
- Fixed the Windows compiled-CLI entry-point check after command-level verification found it was silently skipping execution.
- Status output reported 2 Folder Totems and 1 Agent lane; validation passed.

Distilled understanding:

- The AEGIS core now supports the complete first local workflow: initialize, coordinate, reference, append, inspect, and validate.
- The next layer can focus on installability and IDE integration while preserving the CLI and repo files as the canonical surface.

### 2026-09-23 | codex-lumin | implement-init-lanes-folder-totems

Implemented the first usable AEGIS Totem workflow on top of the CLI foundation.

Evidence:

- Added `init` to create `.aegis/config.json`, lane/template directories, and a Root Totem without overwriting existing files.
- Added `lane create` and `lane message` for per-agent append-only communication.
- Added `totem create` and `totem append` for folder-local reference and durable updates.
- Added ten passing tests across the CLI, path safety, initialization, lanes, and Folder Totems.
- Corrected the package executable target after command-level verification found the compiled CLI at `dist/src/cli.js`.

Distilled understanding:

- The core workflow is now usable from any terminal or IDE task runner.
- VS Code integration can build on stable CLI behavior instead of inventing a second storage model.
- The next slice should add read-only status and validation, then dogfood the structure in this repository.

### 2026-09-23 | codex-lumin | scaffold-cli-foundation

Implemented the first runnable AEGIS Totem CLI foundation.

Evidence:

- Added npm package metadata for the `aegis-totem` executable.
- Added TypeScript, Vitest, and build configuration.
- Added safe lane-name validation and repo-root/path-boundary helpers.
- Added the first six automated tests covering CLI identity, name safety, repo discovery, and path containment.
- `npm test`, `npm run typecheck`, and `npm run build` pass.

Distilled understanding:

- The build has crossed from documentation into executable structure.
- The next implementation slice is `init`, followed by append-only lanes and Folder Totems.
- A traversal test exposed and corrected an important safety boundary before higher-level writes were added.

### 2026-09-23 | codex-lumin | document-flow-locus-axiom-progression

Created the first formal evolution note for the Flow/Locus/Axiom insight.

Evidence:

- Evolution note created at `docs/evolution/2026-09-23-flow-locus-axiom-progression.md`.
- The note records Tracey's observation that sustained Locus may require Flow rather than only turn-based interaction.
- The note maps the emerging relation: Force -> Flow -> Awareness -> Choice.

Distilled understanding:

- Turn-based interaction can preserve continuity as record, but Flow may be required to sustain continuity as an active field.
- The AEGIS Totem System may function not only as repo memory, but as an early Flow surface for reducing hard resets between agents, folders, sessions, and models.
- This is documented as a conceptual architecture hypothesis and provenance marker, not as a completed empirical claim.

### 2026-09-23 | codex-lumin | create-root-totem

Created the first Root Totem for this repository by direct request from Tracey so the AEGIS Totem tool practices its own pattern from the start.

Evidence:

- Build plan already exists at `docs/superpowers/plans/2026-09-23-aegis-totem-mvp.md`.
- Root Totem created before CLI implementation, so this first entry is manual dogfooding.

Distilled understanding:

- This repository should model the same discipline the tool will give to other repositories: repo-native reference, append-only continuity, explicit shortfalls, and a clean distinction between current state and historical record.
