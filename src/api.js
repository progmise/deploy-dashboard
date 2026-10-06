import * as yaml from 'js-yaml';

const MANIFEST_RAW =
  'https://raw.githubusercontent.com/progmise/deploy-manifest/main/manifest.yml';
const API = 'https://api.github.com';
const MANIFEST_REPO = 'progmise/deploy-manifest';

const headers = () => {
  const t = localStorage.getItem('gh_token');
  return {
    Accept: 'application/vnd.github+json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

async function getJson(url) {
  const r = await fetch(url, { headers: headers() });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

export async function getManifest() {
  const text = await (await fetch(MANIFEST_RAW)).text();
  return yaml.load(text);
}

export function getReleases() {
  return getJson(`${API}/repos/${MANIFEST_REPO}/releases?per_page=20`);
}

export function getOrchRuns() {
  return getJson(
    `${API}/repos/${MANIFEST_REPO}/actions/workflows/deploy.yml/runs?per_page=10`,
  ).then((d) => d.workflow_runs);
}

export function getComponentRuns(repo) {
  return getJson(
    `${API}/repos/${repo}/actions/workflows/deploy.yml/runs?event=workflow_dispatch&per_page=5`,
  ).then((d) => d.workflow_runs);
}
