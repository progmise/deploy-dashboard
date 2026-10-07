import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { getComponentRuns } from './api.js';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#e6f0f5',
    primaryBorderColor: '#128e8a',
    primaryTextColor: '#23272e',
    lineColor: '#128e8a',
    fontFamily: "'Open Sans', 'Segoe UI', system-ui, sans-serif",
  },
});

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

export const badge = (conclusion, status) => {
  if (status !== 'completed')
    return <span className="pill running">{status.replaceAll('_', ' ')}</span>;
  const cls = conclusion === 'success' ? 'ok' : 'fail';
  return <span className={`pill ${cls}`}>{conclusion}</span>;
};

export function Releases({ items }) {
  return (
    <table>
      <thead>
        <tr><th>Release</th><th>Versión</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id}>
            <td>{r.name || r.tag_name}</td>
            <td><code>{r.tag_name}</code></td>
            <td>{r.draft
              ? <span className="pill draft">Borrador</span>
              : <span className="pill ok">Publicado</span>}</td>
            <td>{new Date(r.created_at).toLocaleDateString()}</td>
            <td><a href={r.html_url} target="_blank" rel="noreferrer">↗</a></td>
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
  if (!runs.length) return <span className="muted">sin deploys</span>;
  const r = runs[0];
  return (
    <a href={r.html_url} target="_blank" rel="noreferrer">
      {badge(r.conclusion, r.status)}{' '}
      <span className="muted">{new Date(r.created_at).toLocaleString()}</span>
    </a>
  );
}

export function OrchRuns({ runs }) {
  return (
    <table>
      <thead>
        <tr><th>Run</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.id}>
            <td>{r.display_title || `#${r.run_number}`}</td>
            <td>{badge(r.conclusion, r.status)}</td>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td><a href={r.html_url} target="_blank" rel="noreferrer">↗</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
