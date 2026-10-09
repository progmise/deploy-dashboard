import { mergeCatalog } from '../../../domain/component.js';
import { retryProvision } from '../../../infrastructure/api/catalogApi.js';
import { StatusPill } from '../../components/Feedback.jsx';
import ComponentRuns from './ComponentRuns.jsx';

const dateOnly = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

export default function ComponentsTable({ manifest, catalog, templates = [], q, onChanged }) {
  const kindOf = (name) => templates.find((t) => t.name === name)?.kind;
  const rows = mergeCatalog(manifest.components, catalog)
    .filter((c) => !q
      || c.name.toLowerCase().includes(q)
      || c.repo.toLowerCase().includes(q)
      || (c.db?.shortname || '').toLowerCase().includes(q)
      || (c.db?.template || '').toLowerCase().includes(q));

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th><th>Nombre corto</th><th>Plantilla</th><th>Repo</th>
          <th>Versión</th><th>Dependencias</th><th>Creado</th>
          <th>Estado</th><th>Último run</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => {
          const kind = c.db ? kindOf(c.db.template) : 'app';
          return (
            <tr key={c.name}>
              <td><strong>{c.name}</strong></td>
              <td><code>{c.db?.shortname || '—'}</code></td>
              <td>{c.db
                ? <>{c.db.template}{' '}<span className={`chip${kind === 'lib' ? '' : ' chip-teal'}`}>{kind || '?'}</span></>
                : <span className="muted">—</span>}</td>
              <td><a href={`https://github.com/${c.repo}`} target="_blank" rel="noreferrer">{c.repo}</a></td>
              <td><code>{c.tag}</code></td>
              <td><span className="chips">
                {(c.needs || []).length
                  ? c.needs.map((n) => <span key={n} className="chip">{n}</span>)
                  : <span className="muted">—</span>}
              </span></td>
              <td><span className="muted">{dateOnly(c.db?.created_at)}</span></td>
              <td>{c.db
                ? <>
                    <StatusPill status={c.db.status} />
                    {c.db.status === 'failed' &&
                      <button className="btn btn-outline" style={{ padding: '2px 10px', marginLeft: 8 }}
                        onClick={() => retryProvision(c.name).then(onChanged).catch(onChanged)}>↻</button>}
                  </>
                : <span className="pill outline">deployed</span>}</td>
              <td><ComponentRuns repo={c.repo}
                workflow={kind === 'lib' ? 'release.yml' : 'deploy.yml'} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
