import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const app = express();
const PORT = process.env.PORT || 8080;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const COOKIE = 'gh_token';

const baseUrl = (req) =>
  `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;

const readCookie = (req) =>
  (req.headers.cookie || '').split(';').map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))?.split('=')[1];

const ghFetch = (token, url, opts = {}) =>
  fetch(url, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });

// --- Auth (GitHub OAuth) ---------------------------------------------------

app.get('/api/auth/login', (req, res) => {
  const redirect = `${baseUrl(req)}/api/auth/callback`;
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirect)}&scope=read:user`,
  );
});

app.get('/api/auth/callback', async (req, res) => {
  const r = await ghFetch(null, 'https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code,
    }),
  });
  const data = await r.json();
  if (!data.access_token) return res.status(401).send('OAuth failed');
  res.setHeader('Set-Cookie',
    `${COOKIE}=${data.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
  res.redirect('/');
});

app.get('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
  res.redirect('/');
});

app.get('/api/me', async (req, res) => {
  const token = readCookie(req);
  if (!token) return res.status(401).json({ error: 'not authenticated' });
  const r = await ghFetch(token, 'https://api.github.com/user');
  if (!r.ok) return res.status(401).json({ error: 'bad token' });
  const u = await r.json();
  res.json({ login: u.login, avatar_url: u.avatar_url });
});

// --- Data ------------------------------------------------------------------

// Proxy: /api/gh/<github api path>?<query> — uses the caller's own token.
app.get('/api/gh/{*splat}', async (req, res) => {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const r = await ghFetch(readCookie(req),
    `https://api.github.com/${req.params.splat.join('/')}${query}`);
  res.status(r.status).json(await r.json().catch(() => ({})));
});

app.get('/api/manifest', async (req, res) => {
  const r = await fetch(
    'https://raw.githubusercontent.com/progmise/deploy-manifest/main/manifest.yml');
  res.type('text/yaml').send(await r.text());
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: pkg.version }));

// --- SPA -------------------------------------------------------------------

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
app.use(express.static(dist));
app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () => console.log(`deploy-dashboard:${pkg.version} on :${PORT}`));
