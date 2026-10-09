import { useComponentRuns } from '../../../application/useComponentRuns.js';
import { RunBadge } from '../../components/Feedback.jsx';

export default function ComponentRuns({ repo, workflow }) {
  const runs = useComponentRuns(repo, workflow);
  if (!runs) return <span className="muted">…</span>;
  if (!runs.length) return <span className="muted">sin runs</span>;
  const r = runs[0];
  return (
    <a href={r.html_url} target="_blank" rel="noreferrer">
      <RunBadge conclusion={r.conclusion} status={r.status} />{' '}
      <span className="muted">{new Date(r.created_at).toLocaleString()}</span>
    </a>
  );
}
