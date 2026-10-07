import { useEffect, useRef } from 'react';
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

export default function DependencyGraph({ components }) {
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
