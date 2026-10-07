export function getMe() {
  return fetch('/api/me').then((r) =>
    r.ok ? r.json() : r.status === 403 ? { forbidden: true } : null);
}
