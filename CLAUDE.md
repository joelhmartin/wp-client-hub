# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Next.js (port 3000, turbopack) + WebSocket server (port 3001) via concurrently
npm run build        # Production build
npm run start        # Production Next.js + WebSocket server
npm run seo:setup    # Create/migrate Postgres SEO tables
```

There are no test or lint scripts configured. ESLint is installed but has no custom config beyond `eslint-config-next`.

## Architecture Overview

WP Client Hub is a WordPress site management dashboard for ~116 Kinsta sites (168 environments). It has three runtime processes:

1. **Next.js app** (port 3000) — UI + API routes
2. **WebSocket server** (port 3001) — bridges xterm.js terminals in the browser to node-pty processes on the server
3. **SQLite DB** (`data/wp-client-hub.db`) — auto-created on first run, populated via Kinsta API

An optional **PostgreSQL** database (`wp_seo_engine`) powers the SEO engine subsystem.

### Two-Server Pattern

The WebSocket server (`server/ws-server.ts`) runs as a separate process from Next.js. It directly imports from `src/lib/` (db, kinsta-api, workspaces) — these modules are shared between both servers. The WS server handles all terminal PTY lifecycle: spawning Claude CLI or SSH sessions, streaming I/O, and password resolution.

The Next.js API routes (`src/app/api/`) handle everything else: site listing, credential management, CLAUDE.md editing, and the full SEO engine workflow.

### Terminal System

When a user connects to a site, the WS server spawns one of two terminal types:
- **Claude mode**: Runs `/Users/bif/.local/bin/claude` CLI with SSH context injected as a system prompt
- **SSH mode**: Runs `/opt/homebrew/bin/sshpass` piping the password via `SSHPASS` env var

Key files: `server/ws-server.ts` (WS connection handler, PTY spawning, password resolution), `src/lib/terminal-manager.ts` (PTY process tracking singleton)

### State Management

Two Zustand stores:
- `src/stores/terminal-store.ts` — Tab groups (one per connected site), active sub-tabs (`claude | ssh | claude-md | seo`), Claude mode selection, toast notifications
- `src/stores/seo-store.ts` — Crawl state, plan state, execution progress, timeline history

### SEO Engine

A full crawl → plan → execute → rollback pipeline in `src/lib/seo/`:
- Crawls site data via WP-CLI over SSH (`ssh-executor.ts` uses `child_process.execFile` with sshpass, not node-pty)
- Claude generates optimization plans via `@anthropic-ai/sdk` (the Anthropic API, not the CLI)
- Plan execution applies changes via WP-CLI, with content backups for rollback
- All state persisted in PostgreSQL

API routes under `src/app/api/seo/` expose: config, crawl, plan, execute, rollback, review, history, semrush.

UI components under `src/components/seo/` with inner tabs: Plan, Execute, Review, History, Config.

### Password Management

SSH passwords flow: Kinsta API → encrypted (AES-256-GCM) in SQLite → decrypted at terminal spawn time. Passwords are fetched lazily on first connection and cached. Fallback: `KINSTA_USER_PASSWORD` env var.

Encryption implemented in `src/lib/crypto.ts`. Key from `DB_ENCRYPTION_KEY` env var (64-char hex).

## Key Configuration

- `next.config.ts`: `serverExternalPackages: ['better-sqlite3', 'node-pty', 'pg']` — these native modules must not be bundled by webpack
- `postinstall` script: `chmod +x` on node-pty's spawn-helper for macOS ARM
- DB auto-creates tables on first `getDb()` call (schema in `src/lib/db/schema.ts`)

## Environment Variables

See `.env.example`. Required: `KINSTA_API_KEY`, `KINSTA_USER`, `KINSTA_USER_PASSWORD`, `KINSTA_AGENCY_ID`, `DB_ENCRYPTION_KEY`. SEO engine also needs `POSTGRES_*` vars.

## Parallel Codebase: WP Client Hub Online

This project has a sibling deployment at `/Volumes/G-DRIVE SSD/DEVELOPER/wp-client-hub-online` that is nearly identical in structure but runs on Google Cloud and uses Gemini instead of Claude.

**When making changes to this project, always run a parallel agent to apply the same changes to `wp-client-hub-online`.** The two codebases share the same DB schema, Kinsta API integration, credential management, SEO engine, and most UI components. Only the AI interaction layer differs.

### Key Differences

| This project (local) | Online version |
|---|---|
| Claude CLI via `node-pty` PTY in xterm.js terminal | Gemini chat UI with function calling (no PTY) |
| Two processes: Next.js + `server/ws-server.ts` | Single process: Next.js only |
| `@anthropic-ai/sdk` for SEO plans | `@google/genai` for SEO plans + chat |
| `terminal-store.ts` (sub-tabs: `claude\|ssh\|claude-md\|seo`) | `chat-store.ts` (sub-tabs: `chat\|ai-instructions\|seo`) |
| No auth (local dev) | Google IAP auth on Cloud Run |
| SQLite WAL mode | SQLite DELETE mode (GCS FUSE) |
| `node-pty`, `ws`, `xterm.js` deps | No PTY deps; `@google/genai` instead |

### What to Mirror

Changes to these areas should always be mirrored:
- `src/lib/db/` — schema, queries, credential management
- `src/lib/kinsta-api.ts` — API client, environment fetching
- `src/lib/crypto.ts` — encryption
- `src/lib/seo/` — crawler, plan executor, rollback, queries
- `src/app/api/` — site routes, credential routes, SEO routes
- `src/lib/workspaces.ts` — workspace management
- UI components (sidebar, site list, SEO panels) — adapt as needed

### What NOT to Mirror

- `server/ws-server.ts` — no equivalent in online version
- `src/components/terminal/` — replaced by `src/components/chat/` online
- `src/lib/terminal-manager.ts` — no equivalent online
- Claude CLI-specific logic (system prompts, PTY spawning)
- File upload to PTY (online version handles file attachments differently)
