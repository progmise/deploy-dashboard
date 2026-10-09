import { mergeCatalog } from '../../../domain/component.js';
import { retryProvision } from '../../../infrastructure/api/catalogApi.js';
import { StatusPill } from '../../components/Feedback.jsx';
import { GhIcon, PrIcon } from '../../components/Icons.jsx';

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
          <th>Nombre</th><th>Nombre corto</th><th>Plantilla</th>
          <th>Creado</th><th>Herramientas</th><th>Estado</th>
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
                ? <>{templates.find((t) => t.name === c.db.template)?.display_name || c.db.template}{' '}
                    <span className={`chip${kind === 'lib' ? '' : ' chip-teal'}`}>{kind || '?'}</span></>
                : <span className="muted">—</span>}</td>
              <td><span className="muted">{dateOnly(c.db?.created_at)}</span></td>
              <td><span className="tools">
                <a href={`https://github.com/${c.repo}`} target="_blank" rel="noreferrer"
                   title={c.repo}>{GhIcon}</a>
                {c.db?.manifest_pr &&
                  <a href={`https://github.com/progmise/deploy-manifest/pull/${c.db.manifest_pr}`}
                     target="_blank" rel="noreferrer"
                     title={`PR de registro #${c.db.manifest_pr}`}>{PrIcon}</a>}
              </span></td>
              <td>{c.db
                ? <>
                    <StatusPill status={c.db.status} />
                    {c.db.status === 'failed' &&
                      <button className="btn btn-outline" style={{ padding: '2px 10px', marginLeft: 8 }}
                        title="Reintentar provisioning"
                        onClick={() => retryProvision(c.name).then(onChanged).catch(onChanged)}>↻</button>}
                  </>
                : <span className="muted">—</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
