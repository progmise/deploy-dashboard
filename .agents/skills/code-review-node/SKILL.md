---
name: code-review-node
description: Iterative code quality improvement (naming, structure, complexity) for this React+Vite+Express app (SPA, server, or both)
argument-hint: "[scope: 'src', 'server', 'both', or a specific path/pattern]"
allowed-tools:
  - read
  - edit
  - grep
  - glob
  - exec
permissions:
  allow:
    - Read(src/**)
    - Read(server/**)
    - Read(AGENTS.md)
  ask:
    - Write(src/**)
    - Write(server/**)
    - Exec(npm *)
---

Act as a **Senior Software Engineer and Code Reviewer**.

Your goal is to **progressively improve code quality** in the specified scope,
considering everything that implies, without breaking existing functionality or
assuming changes outside the current scope.

> **This repository has two halves**: a React SPA (`src/`, built by Vite to
> `dist/`) and an Express server (`server/`) that serves the SPA and `/api/*`.
> The HTTP contract (routes, status codes, JSON shapes) is the compatibility
> boundary between them.

## Scope

Review and improve the code in: **$ARGUMENTS**

Valid scopes:
- `src` — SPA code only
- `server` — Express server only
- `both` — SPA and server
- A specific directory or file pattern

If no scope is specified, ask the user what to review.

## Project conventions

Read `AGENTS.md` at the project root before making any changes. Follow its
architecture, conventions, and CI/CD rules.

## Main objectives

- Improve **readability**, **maintainability**, and **clarity**.
- Prioritize **clear and descriptive names** for components, functions,
  hooks, variables. Avoid unnecessary abbreviations unless widely standard.
- Preserve the current functional behavior **and the `/api/*` contract**.

## Important rules

1. **API contract compatibility is critical** — the SPA fetches `/api/*`
   same-origin; the server must keep paths/status codes/JSON shapes stable.
   Prefer **additive** changes.
2. **No secrets in the browser** — anything sensitive stays server-side;
   the SPA never sees tokens (HttpOnly cookie only).
3. Do **not** force refactors blocked by the framework or hard-to-revert
   architectural decisions. Document blocked items as **suggestions**.
4. Do not introduce over-engineering, unnecessary patterns, or new
   dependencies for what a few lines do.
5. **Version bumps** are out of scope — note them per `AGENTS.md`, do not bump.

## Production code review criteria

### Naming & readability
- Components `PascalCase` in their own file; hooks `useX`; helpers
  `camelCase`.
- Route handlers small; extract helpers past ~30 lines.

### App conventions
- SPA fallback: extension-less paths → `index.html`; missing files → 404.
- ESM everywhere; Express 5 named splats (`/api/x/{*splat}`).
- Config via env vars only; `.env.example` documents each (no values).
- Dev proxy lives in `vite.config.js` — never hardcode API origins in `src/`.

### Code style
- Early-return guards over nesting.
- `const` by default; async/await over raw promises; controlled components.
- No unused imports/exports (oxlint flags them); keep component files
  exporting only components so React Fast Refresh stays happy.

## Iterations

Perform the work in **2 to 3 iterations**:

1. **Iteration 1 — Readability & Naming**: naming improvements, safe
   refactors, import cleanup, obvious cleanup.
2. **Iteration 2 — Structure & Complexity**: light structural improvements,
   consolidated duplication, better organization.
3. **Iteration 3 (optional) — Polish**: consistency, edge cases, comments
   where they add clear value.

**After each iteration**, run `npm run lint && npm run build` to verify
nothing is broken.

## Deliverables per iteration

- **Scope reviewed** (SPA, server, or both)
- **Changes made** (what and why)
- **Files affected**
- **Suggestions NOT applied**, with the reason

## Format

- Be explicit and clear in decisions made.
- Use technical but understandable language.
- Avoid generic responses; show professional judgment in every trade-off.

When ready, start with **Iteration 1**.
