import { useState } from 'react';
import { publishRelease, deployRelease } from '../../../infrastructure/api/catalogApi.js';
import { useReleaseDetail } from '../../../application/useReleases.js';
import { Ico, ICON, GhIcon } from '../../components/Icons.jsx';

const dateOnly = (iso) => (iso ? new Date(`${iso}`.slice(0, 10)).toLocaleDateString() : '—');

// Stepper — Gluon's Nuevo→Certificación→Pre Producción→Producción→Cerrado,
// mapped to our lifecycle: draft → Publicado → pre deployed → pro deployed
// → all environments succeeded.
const envDone = (rel, env) =>
  rel.deployments?.some((d) => d.environment === env && d.status === 'success');

function stageOf(rel) {
  if (!rel.published) return 0;
  const envs = rel.environments?.length ? rel.environments : [];
  const nonPro = envs.filter((e) => e !== 'pro');
  if (!envs.includes('pro')) return envs.every((e) => envDone(rel, e)) ? 4 : 2;
  if (!nonPro.every((e) => envDone(rel, e))) return 1;
  if (!envDone(rel, 'pro')) return 2;
  return 4;
}

const STEPS = ['Nuevo', 'Publicado', 'Pre Producción', 'Producción', 'Cerrado'];

// Deployment state drives the action icons: play stays enabled until the
// env deploy succeeds; the GitHub icon links to the run once it exists.
const deployState = (rel, env) =>
  rel.deployments?.find((d) => d.environment === env);

const RUNNING = new Set(['dispatched', 'queued', 'in_progress', 'requested']);

export default function ReleaseDetail({ number, onBack }) {
  const { release, error, reload } = useReleaseDetail(number);
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState(null);

  const act = async (key, fn) => {
    setBusy(key);
    setActionError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (error) return <div className="card"><p className="alert-error">{error}</p></div>;
  if (!release) return <div className="card"><p className="muted">Cargando…</p></div>;

  const stage = stageOf(release);
  const envs = (release.environments?.length ? release.environments : ['pre', 'pro'])
    .map((name, i) => ({ name, order: i + 1 }));

  return (
    <>
      <div className="card">
        <div className="rls-steps">
          {STEPS.map((s, i) => (
            <span key={s} className={`rls-step${i < stage ? ' done' : i === stage ? ' active' : ''}`}>
              <span className="rls-dot">{i < stage ? '✓' : i + 1}</span>{s}
            </span>
          ))}
        </div>
        <div className="rls-head">
          <div className="rls-meta">
            <span>Release: <strong>{release.release_no}</strong></span>
            <span>Versión: <code>{release.version}</code>{' '}
              {release.published
                ? <span className="pill ok">Publicado</span>
                : <button className="pill draft pill-btn"
                    title="Publicar el draft del manifest — dispara el release"
                    disabled={busy === 'publish'}
                    onClick={() => act('publish', () => publishRelease(number))}>
                    {busy === 'publish' ? 'Publicando…' : 'draft'}
                  </button>}
            </span>
            <span className="muted">{release.description}</span>
            <span className="muted">Fecha prevista: {dateOnly(release.planned_date)}</span>
          </div>
          <div className="rls-actions">
            {release.gh_release_url &&
              <a className="btn btn-outline" href={release.gh_release_url}
                target="_blank" rel="noreferrer">GitHub ↗</a>}
            <button className="btn btn-outline" onClick={() => act('refresh', reload)}
              title="Actualizar Release">
              <Ico d={ICON.refresh} /> Actualizar Release
            </button>
            <button className="btn-text btn-cancel" onClick={onBack}>← Releases</button>
          </div>
        </div>
        {actionError && <div className="alert-error">{actionError}</div>}
      </div>

      <div className="card">
        <p className="tbl-legend">Ambientes del release</p>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Tipo</th><th>Orden</th><th>Fecha prevista</th>
              <th>Estado</th><th>Action</th></tr>
          </thead>
          <tbody>
            {envs.map((e) => {
              const dep = deployState(release, e.name);
              const deployed = dep?.status === 'success';
              const running = RUNNING.has(dep?.status);
              return (
                <tr key={e.name}>
                  <td><strong>{e.name}</strong></td>
                  <td className="muted">{e.name === 'pro' ? 'production' : 'preproduction'}</td>
                  <td className="muted">{e.order}</td>
                  <td className="muted">{dateOnly(release.planned_date)}</td>
                  <td>{deployed ? <span className="pill ok">DEPLOYED</span>
                    : running ? <span className="pill running">{dep.status}</span>
                    : dep ? <span className="pill fail">{dep.status}</span>
                    : <span className="pill outline">READY</span>}</td>
                  <td><span className="tools">
                    <button className="tool-btn"
                      title={release.published ? `Desplegar en ${e.name}` : 'Publicá el release primero'}
                      disabled={!release.published || deployed || running || busy === `dep-${e.name}`}
                      onClick={() => act(`dep-${e.name}`, () => deployRelease(number, e.name))}>
                      {running ? '…' : <Ico d={ICON.play} />}
                    </button>
                    {dep?.run_url
                      ? <a href={dep.run_url} target="_blank" rel="noreferrer"
                          title="Run del despliegue en el manifest">{GhIcon}</a>
                      : <span className="tool-disabled" title="Sin run todavía">{GhIcon}</span>}
                  </span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
