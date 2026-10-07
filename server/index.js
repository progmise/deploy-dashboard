import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const app = express();
const PORT = process.env.PORT || 8080;
// The real backend (deploy-orchestrator-api). Requests to /api/* are proxied
// there with the caller's cookies — same-origin from the browser's view, so
// the session cookie stays SameSite=Lax and no CORS is needed.
const API_UPSTREAM = (process.env.API_UPSTREAM || 'http://localhost:8081').replace(/\/$/, '');

const HOP_REQ = new Set(['connection', 'keep-alive', 'transfer-encoding',
  'content-length', 'host', 'content-encoding']);
const HOP_RES = new Set(['connection', 'keep-alive', 'transfer-encoding',
  'content-length', 'content-encoding']);

app.use('/api', async (req, res) => {
  try {
    const upstream = new URL(API_UPSTREAM);
    const headers = {};
    for (const [k, v] of Object.entries(req.headers))
      if (!HOP_REQ.has(k)) headers[k] = v;
    headers.host = upstream.host;
    headers['x-forwarded-host'] = req.headers['x-forwarded-host'] || req.headers.host;
    headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'https';
    const r = await fetch(API_UPSTREAM + req.originalUrl, {
      method: req.method,
      redirect: 'manual',
      headers,
      // Forward the request body for non-GET methods (POST /api/components…);
      // duplex:'half' is required by undici for streamed request bodies.
      ...(req.method !== 'GET' && req.method !== 'HEAD'
        ? { body: req, duplex: 'half' }
        : {}),
    });
    res.status(r.status);
    r.headers.forEach((v, k) => { if (!HOP_RES.has(k)) res.setHeader(k, v); });
    const sc = r.headers.getSetCookie?.() || [];
    if (sc.length) res.setHeader('set-cookie', sc);
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch {
    res.status(502).json({ error: 'upstream unavailable' });
  }
});

// --- SPA -------------------------------------------------------------------

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
app.use(express.static(dist));
// SPA fallback only for extension-less routes — missing assets must 404,
// not serve HTML (breaks module loading with confusing MIME errors).
app.use((req, res) =>
  req.path.includes('.')
    ? res.sendStatus(404)
    : res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () =>
  console.log(`${pkg.name}:${pkg.version} on :${PORT} → api ${API_UPSTREAM}`));
