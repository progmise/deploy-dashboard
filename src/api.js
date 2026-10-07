import * as yaml from 'js-yaml';

// All GitHub reads go through the backend (/api/gh/*) using the caller's
// OAuth session — no tokens in the browser.

const MANIFEST_REPO = 'progmise/deploy-manifest';

async function getJson(url) {
  const r = await fetch(url);
  if (r.status === 401) {
    window.dispatchEvent(new Event('auth:required'));
    throw new Error('401');
  }
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

export function getMe() {
  return fetch('/api/me').then((r) =>
    r.ok ? r.json() : r.status === 403 ? { forbidden: true } : null);
}

export async function getManifest() {
  const text = await (await fetch('/api/manifest')).text();
  return yaml.load(text);
}

export function getReleases() {
  return getJson(`/api/gh/repos/${MANIFEST_REPO}/releases?per_page=20`);
}

export function getOrchRuns() {
  return getJson(
    `/api/gh/repos/${MANIFEST_REPO}/actions/workflows/deploy.yml/runs?per_page=10`,
  ).then((d) => d.workflow_runs);
}

export function getComponentRuns(repo) {
  return getJson(
    `/api/gh/repos/${repo}/actions/workflows/deploy.yml/runs?event=workflow_dispatch&per_page=5`,
  ).then((d) => d.workflow_runs);
}

// --- Component catalog (Supabase-backed, via the API) ------------------------

export function getTemplates() {
  return getJson('/api/templates');
}

export function getComponents() {
  return getJson('/api/components');
}

export function getComponent(name) {
  return getJson(`/api/components/${encodeURIComponent(name)}`);
}

export async function createComponent(body) {
  const r = await fetch('/api/components', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || r.status), { component: data.component });
  return data;
}

export async function retryProvision(name) {
  const r = await fetch(`/api/components/${encodeURIComponent(name)}/provision`, { method: 'POST' });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || r.status), { component: data.component });
  return data;
}
