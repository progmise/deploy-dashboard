import { useState } from 'react';
import { STATUS_LABEL } from '../../../domain/component.js';

// Dropdown filter panel for the components table (plantilla + estado).
// `filters` = { plantilla: '', estado: '' } — empty string = no filter.
const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

export default function FiltersMenu({ templates = [], filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const active = Object.values(filters).filter(Boolean).length;

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <span className="filters-menu">
      <button className={`btn btn-teal${active ? ' has-active' : ''}`}
        onClick={() => setOpen((o) => !o)}>
        Filtros {active > 0 && <span className="filters-count">{active}</span>} ⌄
      </button>
      {open && (
        <span className="filters-pop" onMouseLeave={() => setOpen(false)}>
          <label className="field">
            <span>Plantilla</span>
            <select value={filters.plantilla} onChange={(e) => set('plantilla', e.target.value)}>
              <option value="">Todas</option>
              {templates.map((t) => (
                <option key={t.name} value={t.name}>{t.display_name || t.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Estado</span>
            <select value={filters.estado} onChange={(e) => set('estado', e.target.value)}>
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>
              ))}
            </select>
          </label>
          {active > 0 && (
            <button className="btn-text btn-cancel" style={{ fontSize: 12 }}
              onClick={() => setFilters({ plantilla: '', estado: '' })}>Limpiar</button>
          )}
        </span>
      )}
    </span>
  );
}
