import { mergeCatalog } from '../../../domain/component.js';
import { retryProvision } from '../../../infrastructure/api/catalogApi.js';
import { StatusPill } from '../../components/Feedback.jsx';
import ComponentRuns from './ComponentRuns.jsx';

export default function ComponentsTable({ manifest, catalog, q, onChanged }) {
  const rows = mergeCatalog(manifest.components, catalog)
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.repo.toLowerCase().includes(q));

  return (
    <table>
      <thead>
        <tr><th>Nombre</th><th>Repo</th><th>Versión</th><th>Dependencias</th><th>Estado</th><th>Último deploy</th></tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.name}>
            <td><strong>{c.name}</strong></td>
            <td><a href={`https://github.com/${c.repo}`} target="_blank" rel="noreferrer">{c.repo}</a></td>
            <td><code>{c.tag}</code></td>
            <td><span className="chips">
              {(c.needs || []).length
                ? c.needs.map((n) => <span key={n} className="chip">{n}</span>)
                : <span className="muted">—</span>}
            </span></td>
            <td>{c.db
              ? <>
                  <StatusPill status={c.db.status} />
                  {c.db.status === 'failed' &&
                    <button className="btn btn-outline" style={{ padding: '2px 10px', marginLeft: 8 }}
                      onClick={() => retryProvision(c.name).then(onChanged).catch(onChanged)}>↻</button>}
                </>
              : <span className="pill outline">deployed</span>}</td>
            <td><ComponentRuns repo={c.repo} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
