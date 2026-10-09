import { useState } from 'react';
import { SearchRow } from '../../components/Feedback.jsx';

// Template catalog page — the "Nuevo componente" destination. Picking a
// card opens the stepped wizard (Información → Personalización → Resumen).
export default function TemplateGallery({ templates, onPick }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const shown = (templates || []).filter((t) =>
    (kind === 'all' || t.kind === kind)
    && (!q || [t.name, t.display_name, t.description].join(' ').toLowerCase().includes(q)));

  return (
    <div className="card">
      <h2>Crear un nuevo componente</h2>
      <p className="muted">Crear un nuevo componente utilizando plantillas</p>
      <SearchRow q={q} setQ={setQ} placeholder="Buscar plantilla por nombre…"
        action={
          <span className="chips" style={{ marginLeft: 'auto' }}>
            {[['all', 'Todas'], ['app', 'Apps'], ['lib', 'Libs']].map(([v, l]) => (
              <button key={v}
                className={`chip${kind === v ? ' chip-teal' : ''}`}
                style={{ cursor: 'pointer', border: 'none' }}
                onClick={() => setKind(v)}>{l}</button>
            ))}
          </span>
        } />
      {!templates && <p className="muted">Cargando plantillas…</p>}
      <div className="tpl-grid">
        {shown.map((t) => (
          <button key={t.name} className="tpl-card" onClick={() => onPick(t)}>
            <strong>{t.display_name || t.name}</strong>
            <span className="muted">{t.description || '—'}</span>
            <span className={`chip${t.kind === 'lib' ? '' : ' chip-teal'}`}>{t.kind}</span>
            <span className="muted" style={{ fontSize: 11 }}>{t.name}</span>
          </button>
        ))}
      </div>
      {templates && !shown.length && <p className="muted">Sin plantillas para ese filtro.</p>}
    </div>
  );
}
