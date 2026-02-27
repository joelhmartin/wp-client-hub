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


## Chrome Extension Workflow

When using the Claude Chrome extension (MCP), follow these rules to preserve context and avoid token waste.

### Full-Page Screenshots (No Scroll-and-Stitch)

**Never** perform sequential scroll + screenshot operations to visually test a page. Use the full-page capture approach instead — this saves significant tokens and produces the same accuracy.

```javascript
// full-page-screenshot.js — Run via Chrome DevTools Protocol
// Captures entire page in one shot instead of scroll+stitch
(async () => {
  const { height } = await new Promise(resolve => {
    const body = document.body;
    const html = document.documentElement;
    const h = Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    resolve({ height: h });
  });
  window.__FULL_PAGE_HEIGHT = height;
  window.scrollTo(0, 0);
})();
```

Use `screenshot` with `fullPage: true` if supported, or capture at the calculated `__FULL_PAGE_HEIGHT` viewport. Do **not** scroll incrementally and stitch.

### Targeted DOM Extraction (No Bulk HTML Loading)

**Never** load all HTML inside `<main>` or `<body>` for a simple task. Instead:

1. Identify the **specific selector(s)** relevant to the task.
2. Extract **only** those elements using targeted queries.
3. Limit extracted content to the minimum needed.

**Bad:** `document.querySelector('main').innerHTML` (loads everything, bloats context)
**Good:** `document.querySelector('.hero-section').innerHTML` (loads only what's needed)

Rules:
- For content checks, extract only the specific `div`, `section`, or component.
- For form testing, extract only the `form` and its children.
- For navigation testing, extract only `nav` or `header`.
- Never extract more than 2–3 targeted sections in a single operation.

### Dismiss Cookie Banners & Pop-ups Automatically

Before interacting with any website content, **always** run the pop-up dismissal script first. Do not use screenshot-and-scroll sequences to find and close banners.

```javascript
// dismiss-popups.js — Run on every new page load before main tasks
(() => {
  const selectors = [
    '[id*="cookie"] button', '[class*="cookie"] button',
    '[id*="consent"] button', '[class*="consent"] button',
    '[class*="banner"] button', '[id*="banner"] button',
    'button[class*="accept"]', 'button[id*="accept"]',
    'a[class*="accept"]', 'button[class*="agree"]',
    'button[id*="agree"]', 'button[class*="allow"]',
    'button[id*="allow"]', 'button[class*="dismiss"]',
    'button[class*="close-banner"]', '[class*="cookie-notice"] button',
    '[class*="gdpr"] button', '[id*="gdpr"] button',
    '[class*="privacy-banner"] button',
    '[data-testid*="cookie"] button', '[data-testid*="consent"] button',
    '[aria-label*="accept cookies"]', '[aria-label*="Accept cookies"]',
    '[aria-label*="close"]', '[aria-label*="dismiss"]',
    '.modal-backdrop', '[class*="overlay"][class*="cookie"]',
    '[class*="popup"] [class*="close"]', '[class*="modal"] [class*="close"]',
  ];
  const clickPatterns = [
    /accept\s*(all)?/i, /agree/i, /allow\s*(all)?/i,
    /got\s*it/i, /ok(ay)?/i, /I\s*understand/i,
    /continue/i, /dismiss/i, /close/i,
  ];
  for (const sel of selectors) {
    try {
      document.querySelectorAll(sel).forEach(el => {
        if (el.offsetParent !== null) el.click();
      });
    } catch (e) {}
  }
  const allButtons = document.querySelectorAll('button, a[role="button"], [class*="btn"]');
  for (const btn of allButtons) {
    const text = (btn.textContent || '').trim();
    if (clickPatterns.some(p => p.test(text)) && btn.offsetParent !== null) {
      btn.click();
      break;
    }
  }
  document.querySelectorAll('[class*="cookie-overlay"], [class*="consent-overlay"], [id*="cookie-overlay"]').forEach(el => el.remove());
  document.querySelectorAll('[class*="cookie"], [class*="consent"], [id*="cookie"], [id*="consent"]').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'sticky') el.remove();
  });
})();
```

### Authentication & CAPTCHAs

Claude **cannot** complete CAPTCHAs or log in on your behalf. Before assigning any task on a site that requires authentication:

1. Open the target site in Chrome manually.
2. Complete any login or CAPTCHA verification.
3. Ensure the session is active and authenticated.
4. **Then** give Claude the task.

If Claude encounters a CAPTCHA or login wall during a task, stop and inform the user immediately.

### Context Window Management

Browser operations consume significantly more context than regular tool calls:
- If context is above **60%**, run a compact before proceeding.
- If context reaches **75%** during a task, pause, document progress, and compact before continuing.
- Minimize unnecessary screenshots — use full-page capture when possible.
- Extract only targeted DOM elements, never bulk HTML.
- Dismiss pop-ups via script, not interactively.

### Testing Workflow

**Test file format:**
```markdown
# Test: [Feature/Area Name]
## Priority: [Critical / High / Medium / Low]
## Test Steps
### Step 1: [Action Description]
- **Action:** [What to do]
- **Expected Result:** [What should happen]
```

**Test report format:**
```markdown
# Test Report: [Feature/Area Name]
**Date:** [timestamp] | **Status:** [Pass / Fail / Partial]
## Results Summary
| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | [desc] | Pass/Fail | [notes] |
## Issues Found
- **Issue 1:** [description, severity, reproduction steps]
```

### Chrome Extension Reminders

- **Chrome only** — does not work with other Chromium browsers.
- **Chrome profiles** — may open the wrong profile. Close Chrome, open correct profile, then retry.
- **Long-running tasks** — Manifest V3 can block extensions that run too long. Break work into smaller test runs.
- **Always document before compacting** — generate a progress report first.
- **Console logs** — check the browser console for errors that aren't visually apparent.