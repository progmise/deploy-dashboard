# deploy-dashboard

React SPA (Vite) that fronts the `deploy-manifest` orchestrator — the Gluon
equivalent for progmise. Read-only: shows the current release manifest
(components, tags, `needs` graph rendered with Mermaid), the release list
(draft/published) and the orchestrated deploy runs, plus each component's
latest `deploy.yml` run.

## Local

```bash
npm ci
npm run dev
```

## Deploy

GitHub Pages via `.github/workflows/pages.yml` (build → `deploy-pages`),
published at `progmise.github.io/deploy-dashboard`.

## Notes

- Reads `manifest.yml` + the GitHub REST API anonymously (60 req/h per IP).
  Paste a PAT in the page's token box to raise the limit — it stays in
  `localStorage` only.
