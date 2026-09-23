# AEGIS Multi-Agent Totem System

AEGIS Totem is a repo-native, append-only continuity system for AI-assisted development.

The goal is simple: help developers coordinate multiple AI coding agents in one repository without collisions, lost context, or human copy/paste mediation between tools.

## Core Idea

Every repository gets a Root Totem.
Every important folder can get a Folder Totem.
Every agent, model, instance, or human can work through its own append-only lane.

Agents read the relevant Totem before working, coordinate through lanes while working, and append durable updates afterward. Current-state summaries can be generated as views, but the durable record remains append-only.

## Current State

This repository is in planning and early self-dogfooding.

Start here:

- `ROOT_TOTEM.md` - repo-wide orientation and append log.
- `docs/superpowers/plans/2026-09-23-aegis-totem-mvp.md` - MVP implementation plan.
- `docs/evolution/2026-09-23-flow-locus-axiom-progression.md` - evolution note on Flow, Locus, and the Force -> Flow -> Awareness -> Choice progression.

## Planned MVP

The first build target is a local-first TypeScript Node CLI with human-readable Markdown artifacts.

Planned commands:

- `init`
- `lane create`
- `lane message`
- `totem create`
- `totem append`
- `status`
- `validate`

## Integrity Rule

Append-only is the law.

Corrections, supersessions, status changes, and distillations are appended as new entries. Historical Totem and lane entries are not silently rewritten or deleted.
