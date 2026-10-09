import { useState } from 'react';
import { SearchRow } from '../../components/Feedback.jsx';
import { Ico } from '../../components/Icons.jsx';

const GRID_ICON = 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z';
const LIST_ICON = 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01';

// Template catalog page — the "Nuevo componente" destination. Picking a
// card opens the stepped wizard (Información → Personalización → Resumen).
export default function TemplateGallery({ templates, onPick }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const [mode, setMode] = useState('grid');
  const shown = (templates || []).filter((t) =>
    (kind === 'all' || t.kind === kind)
    && (!q || [t.name, t.display_name, t.description].join(' ').toLowerCase().includes(q)));

  return (
    <div className="card">
      <h2>Crear un nuevo componente</h2>
      <p className="muted">Crear un nuevo componente utilizando plantillas</p>
      <SearchRow q={q} setQ={setQ} placeholder="Buscar plantilla por nombre…"
        action={
          <>
            <span className="chips" style={{ marginLeft: 'auto' }}>
              {[['all', 'Todas'], ['app', 'Apps'], ['lib', 'Libs']].map(([v, l]) => (
                <button key={v}
                  className={`chip${kind === v ? ' chip-teal' : ''}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                  onClick={() => setKind(v)}>{l}</button>
              ))}
            </span>
            <span className="view-toggle">
              <button className={mode === 'grid' ? 'active' : ''} title="Grilla"
                onClick={() => setMode('grid')}><Ico d={GRID_ICON} /></button>
              <button className={mode === 'list' ? 'active' : ''} title="Lista"
                onClick={() => setMode('list')}><Ico d={LIST_ICON} /></button>
            </span>
          </>
        } />
      {!templates && <p className="muted">Cargando plantillas…</p>}
      {mode === 'grid' ? (
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
      ) : (
        <table>
          <tbody>
            {shown.map((t) => (
              <tr key={t.name} className="tpl-row" onClick={() => onPick(t)}>
                <td><strong>{t.display_name || t.name}</strong><br />
                  <span className="muted" style={{ fontSize: 12 }}>{t.name}</span></td>
                <td><span className={`chip${t.kind === 'lib' ? '' : ' chip-teal'}`}>{t.kind}</span></td>
                <td><span className="muted">{t.description || '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {templates && !shown.length && <p className="muted">Sin plantillas para ese filtro.</p>}
    </div>
  );
}

