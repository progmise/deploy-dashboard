import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { getComponentRuns } from './api.js';



mermaid.initialize({ startOnLoad: false, theme: 'dark' });

export function MermaidGraph({ components }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!components?.length) return;
    const names = new Set(components.map((c) => c.name));
    const lines = ['graph BT'];
    for (const c of components) {
      const needs = (c.needs || []).filter((n) => names.has(n));
      if (!needs.length) lines.push(`  ${c.name}`);
      for (const n of needs) lines.push(`  ${n} --> ${c.name}`);
    }
    const id = 'g' + Math.random().toString(36).slice(2);
    mermaid.render(id, lines.join('\n')).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    });
  }, [components]);
  return <div ref={ref} className="mermaid" />;
}

const badge = (conclusion, status) => {
  if (status !== 'completed')
    return <span className="badge running">{status}</span>;
  const cls = conclusion === 'success' ? 'ok' : 'fail';
  return <span className={`badge ${cls}`}>{conclusion}</span>;
};

export function Releases({ items }) {
  return (
    <table>
      <thead>
        <tr><th>Tag</th><th>Name</th><th>State</th><th>Date</th></tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id}>
            <td><a href={r.html_url}>{r.tag_name}</a></td>
            <td>{r.name}</td>
            <td>{r.draft
              ? <span className="badge draft">draft</span>
              : <span className="badge ok">published</span>}</td>
            <td>{new Date(r.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ComponentRuns({ repo }) {
  const [runs, setRuns] = useState(null);
  useEffect(() => {
    getComponentRuns(repo).then(setRuns).catch(() => setRuns([]));
  }, [repo]);
  if (!runs) return <span className="muted">…</span>;
  if (!runs.length) return <span className="muted">no deploys</span>;
  const r = runs[0];
  return (
    <a href={r.html_url}>
      {badge(r.conclusion, r.status)}{' '}
      <span className="muted">{new Date(r.created_at).toLocaleString()}</span>
    </a>
  );
}

export function OrchRuns({ runs }) {
  return (
    <table>
      <thead>
        <tr><th>Run</th><th>Status</th><th>When</th></tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.id}>
            <td><a href={r.html_url}>{r.display_title || `#${r.run_number}`}</a></td>
            <td>{badge(r.conclusion, r.status)}</td>
            <td>{new Date(r.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
