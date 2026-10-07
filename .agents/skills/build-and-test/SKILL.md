---
name: build-and-test
description: Install, lint, build and dockerize this React+Vite+Express app (Vite build, oxlint, Dockerfile)
allowed-tools:
  - read
  - exec
  - grep
  - glob
permissions:
  allow:
    - Read(package.json)
    - Read(src/**)
    - Read(server/**)
  ask:
    - Exec(npm *)
    - Exec(docker *)
---

# Skill: Build and Test — React + Vite + Express app

## Description
Step-by-step guide to install, lint and containerize this app. Two halves:
the **SPA** (`src/` → Vite → `dist/`) and the **server** (`server/index.js`
— Express, serves `dist/` + `/api/*`).

## When to Use
- Installing/building the app for the first time or on a new machine.
- Diagnosing Vite build, dependency or lint failures.
- Building the Docker image locally.

---

## Step 1: Environment
- **Node 20+** (CI uses 24). Confirm the version under test in
  `package.json` (`version` field).

## Step 2: Install
```bash
npm ci          # reproducible, from package-lock.json — never npm install in CI
```

## Step 3: Lint + build
```bash
npm run lint    # oxlint (src/ + server/)
npm run build   # vite build → dist/
```

## Step 4: Tests
```bash
npm test --if-present
```

## Step 5: Dev / prod smoke test
```bash
npm run dev                      # vite dev; proxies /api → :8080
# or the real thing:
PORT=8123 node server/index.js & # serves dist/ + /api/*
curl -sf localhost:8123/api/health                    # → {"status":"ok",...}
curl -s -o /dev/null -w '%{http_code}' localhost:8123 # → 200 (index.html)
curl -s -o /dev/null -w '%{http_code}' localhost:8123/assets/missing.js  # → 404
```

## Step 6: Docker image (optional)
```bash
docker build -t app:dev .
```

## Troubleshooting

| Symptom | Root cause | Fix |
|---|---|---|
| `npm ci` fails on lock mismatch | `package.json` edited without lock | `npm install` once, commit the lockfile |
| Vite build fails on import | wrong casing / missing file | match filesystem casing exactly |
| SPA routes 404 in prod | server fallback not built | `npm run build` first — `dist/` must exist |
| `/api/*` hits Vite in dev | proxy misconfigured | `vite.config.js` `server.proxy` → :8080 |

## Notes
- Do **not** bump `version` as part of a build — see the `app-release` skill.
