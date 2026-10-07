# deploy-dashboard

React SPA + Express backend — the Gluon-equivalent front for the
`deploy-manifest` orchestrator. Sign-in is **GitHub OAuth**; GitHub reads are
proxied through the backend using the caller's own token (cookie `gh_token`,
HttpOnly — nothing secret in the browser).

Shows: the current release manifest (components, tags, `needs` graph via
Mermaid), the release list (draft = pending approval, published = deployable),
orchestrated deploy runs, and each component's latest `deploy.yml` run.

## Stack

- `src/` — React 19 + Vite SPA → `dist/`
- `server/index.js` — Express: static SPA + `/api/auth/*` (OAuth),
  `/api/gh/*` (GitHub API proxy), `/api/manifest`, `/api/health`
- `Dockerfile` — self-contained (npm build → node runtime), `PORT` aware

## Local

```bash
cp .env.example .env   # GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (OAuth App)
npm ci
npm run build
npm start              # :8080
```

Without the OAuth vars the SPA loads but sign-in won't complete; the
dashboard data needs a GitHub session anyway.

## CI/CD

Same `app-*` thin callers as every deployable repo
(`reusable-workflows@v1`): CI on PR, integration publishes
`docker.io/progmise/deploy-dashboard` on merge, release tags + publishes
`:<version>` (version lives in `package.json`), deploy to Vercel via
`deploy.yml` or the `deploy-manifest` orchestrator.

## Required config

Repo secrets/vars: `DOCKER_TOKEN` + `DOCKER_USERNAME` (var),
`VERCEL_TOKEN` + `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` (vars).

Vercel project env vars (Production): `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET`. The OAuth App's callback must be
`https://<project>.vercel.app/api/auth/callback`.

The Vercel project's **Framework Preset must be `Container`**
(Settings → General → Build & Development Settings). Vercel builds
the root `Dockerfile` and routes all traffic to the container —
the Express server serves the SPA, `/api/*` and OAuth on `$PORT`.
