# AGENTS.md

Guide for working on **deploy-dashboard** — the progmise release orchestration
dashboard (React + Vite SPA with a thin Express backend for GitHub OAuth and
API proxying).

## Architecture

Same dependency direction as the APIs' hexagonal layout, React-flavored:
`ui/` → `application/` → `infrastructure/`; `domain/` imports nothing.
Components never call `fetch` directly.

```
src/
  main.jsx                   entry, renders app/App
  app/App.jsx                shell — topbar, crumbs, sidebar, view switch
  domain/component.js        pure rules: NAME_RE/REPO_RE, STATUS_LABEL,
                             mergeCatalog (manifest ⨝ catalog), filter
  application/               use cases as hooks:
    useSession.js            signed-in user + auth:required listener
    useDashboardData.js      manifest + releases + runs + catalog reload
    useComponentRuns.js      last deploy runs of one repo
  infrastructure/api/        the ONLY fetch boundary:
    client.js                apiGet (401 → auth:required event) + apiSend
    sessionApi.js            /api/me
    githubApi.js             /api/gh/* proxy + /api/manifest
    catalogApi.js            /api/templates, /api/components*
  ui/
    components/              shared presentational (Feedback, Icons)
    features/
      session/Gate.jsx       Login / Unauthorized / UserMenu
      releases/ReleasesTable.jsx
      components/            ComponentsTable, ComponentRuns,
                             DependencyGraph (mermaid), ComponentWizard —
                             4 steps; "Personalización" renders the
                             template's `fields` (select/fixed) from
                             /api/templates, answers go to components.config
      deployments/OrchRuns.jsx
server/index.js              Express — serves dist/ + /api/*, OAuth, proxies
                             /api/gh → GitHub, /api/manifest, /api/templates,
                             /api/components → deploy-orchestrator-api
```

Rules:
- All API access is same-origin `/api/*` (`vite.config.js` proxies to the API
  in dev). No tokens in the browser — OAuth lives server-side, the session
  rides in an HttpOnly cookie.
- Any 401 from `infrastructure/api/client.js` fires `auth:required`; the app
  drops back to the login screen.
- `StatusPill`/`RunBadge` are components (capitalized) — keep them so, for
  Fast Refresh.
- New external call? Add it to `infrastructure/api/` and consume through an
  `application/` hook — not from a component.

## Verify before done

```bash
npm run build
npm run lint        # oxlint — keep at 0 warnings
```

## Branches

GitFlow: `main` is the default branch and holds releases; `development` is
the integration branch (all work is PR'd there).
Work branches: `<type>/<snake_description>` — `feature/`, `fix/`, `chore/`,
`docs/`, `refactor/`.

## Release

All pipeline logic lives in `progmise/reusable-workflows` (`@v1`,
`secrets: inherit`) — callers in `.github/workflows/` are thin; keep them so.
Bump `version` in `package.json`, merge `development` → `main`, then run the
**Release** workflow manually on `main`. Deploys go through `deploy-manifest`
(`deploy.yml` dispatch); the Vercel project was created lazily on first deploy.
