// Shared presentational bits — pills, cards, search row.
import { STATUS_LABEL } from '../../domain/component.js';

export function CenterCard({ title, sub, children }) {
  return (
    <div className="center-page">
      <div className="login-card">
        <div className="logo-mark">⬡</div>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}

export function SearchRow({ q, setQ, placeholder, action }) {
  return (
    <div className="search-row">
      <label className="search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6b7684" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
      </label>
      {action}
    </div>
  );
}

export function RunBadge({ conclusion, status }) {
  if (status !== 'completed')
    return <span className="pill running">{status.replaceAll('_', ' ')}</span>;
  const cls = conclusion === 'success' ? 'ok' : 'fail';
  return <span className={`pill ${cls}`}>{conclusion}</span>;
}

export function StatusPill({ status }) {
  if (status === 'ready') return <span className="pill ok">Ready</span>;
  if (status === 'failed') return <span className="pill fail">Failed</span>;
  if (!status) return <span className="muted">—</span>;
  return <span className="pill running">{STATUS_LABEL[status] || status}</span>;
}
