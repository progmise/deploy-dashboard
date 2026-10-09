import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

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

// Renders the dependency neighborhood of a single selected component:
// everything it needs (transitively) plus everything that needs it.
export default function DependencyGraph({ components }) {
  const ref = useRef(null);
  const [sel, setSel] = useState('');

  useEffect(() => {
    if (!components?.length || !sel) return;
    const byName = new Map(components.map((c) => [c.name, c]));
    const shown = new Set([sel]);
    const queue = (byName.get(sel)?.needs || []).filter((n) => byName.has(n));
    while (queue.length) {          // upstream: all transitive needs
      const n = queue.shift();
      if (shown.has(n)) continue;
      shown.add(n);
      queue.push(...(byName.get(n)?.needs || []).filter((x) => byName.has(x)));
    }
    for (const c of components)     // downstream: direct dependents of sel
      if ((c.needs || []).includes(sel)) shown.add(c.name);

    const lines = ['graph BT'];
    for (const name of shown) {
      const needs = (byName.get(name)?.needs || []).filter((n) => shown.has(n));
      if (!needs.length) lines.push(`  ${name}`);
      for (const n of needs) lines.push(`  ${n} --> ${name}`);
    }
    const id = 'g' + Math.random().toString(36).slice(2);
    mermaid.render(id, lines.join('\n')).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    });
  }, [components, sel]);

  if (!components?.length) return null;
  const current = components.find((c) => c.name === sel);

  return (
    <>
      <select className="graph-picker" value={sel} onChange={(e) => setSel(e.target.value)}>
        <option value="">Elegí un componente…</option>
        {components.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
      {current && (
        <p className="muted" style={{ fontSize: 12 }}>
          depende de: {current.needs?.length ? current.needs.join(', ') : 'nada'}
          {' · '}requerido por: {components.filter((c) => c.needs?.includes(sel))
            .map((c) => c.name).join(', ') || 'nada'}
        </p>
      )}
      {sel
        ? <div ref={ref} className="mermaid" />
        : <p className="muted">Seleccioná un componente para ver su grafo de dependencias.</p>}
    </>
  );
}
