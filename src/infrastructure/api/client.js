// Fetch boundary — the only module that calls fetch. All reads go through the
// backend (/api/*) using the caller's OAuth session: no tokens in the browser.
export async function apiGet(url) {
  const r = await fetch(url);
  if (r.status === 401) {
    window.dispatchEvent(new Event('auth:required'));
    throw new Error('401');
  }
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

export async function apiSend(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || r.status), { component: data.component });
  return data;
}
