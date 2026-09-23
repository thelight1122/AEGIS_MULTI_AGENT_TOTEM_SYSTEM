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
