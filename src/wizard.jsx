import { useEffect, useState } from 'react';
import { getTemplates, createComponent, retryProvision } from './api.js';

// Provisioning lifecycle — mirrors the state machine in the API
// (src/provision.js). Pending states render as "in progress".
const STATUS_LABEL = {
  pending: 'En cola',
  repo_created: 'Repo creado',
  secrets_written: 'Secrets configurados',
  vars_written: 'Variables configuradas',
  manifest_pr_opened: 'PR al manifest',
  ready: 'Ready',
  failed: 'Falló',
};

export function statusPill(status) {
  if (status === 'ready') return <span className="pill ok">Ready</span>;
  if (status === 'failed') return <span className="pill fail">Failed</span>;
  if (!status) return <span className="muted">—</span>;
  return <span className="pill running">{STATUS_LABEL[status] || status}</span>;
}

export function ComponentWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState(null);
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', repo: '', description: '' });
  const [repoTouched, setRepoTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getTemplates().then(setTemplates).catch((e) => setError(e.message));
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const repoName = repoTouched ? form.repo : form.name;
  const nameOk = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(form.name);
  const repoOk = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(repoName);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const c = await createComponent({ ...form, repo: repoName, template: template.name });
      setResult(c);
      onCreated?.(c);
    } catch (e) {
      setResult(e.component || null);
      setError(e.message);
      onCreated?.(e.component);
    }
    setBusy(false);
  };

  const retry = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await retryProvision(result.name));
      onCreated?.(result);
    } catch (e) {
      setError(e.message);
      if (e.component) setResult(e.component);
    }
    setBusy(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Nuevo componente</h2>
          <button className="btn btn-outline" onClick={onClose}>✕</button>
        </div>

        {!result && (
          <div className="wiz-steps">
            {['Plantilla', 'Información', 'Resumen'].map((l, i) => (
              <span key={l} className={`wiz-step${step === i ? ' active' : ''}${step > i ? ' done' : ''}`}>
                {i + 1}. {l}
              </span>
            ))}
          </div>
        )}

        {error && <div className="alert-error">{error}</div>}

        {!result && step === 0 && (
          <>
            {!templates && !error && <p className="muted">Cargando plantillas…</p>}
            <div className="tpl-grid">
              {(templates || []).map((t) => (
                <button key={t.name}
                  className={`tpl-card${template?.name === t.name ? ' selected' : ''}`}
                  onClick={() => setTemplate(t)}>
                  <strong>{t.name}</strong>
                  <span className="muted">{t.description || '—'}</span>
                  <span className={`chip${t.kind === 'lib' ? '' : ' chip-teal'}`}>{t.kind}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {!result && step === 1 && (
          <div className="form">
            <label className="field">
              <span>Nombre del componente</span>
              <input value={form.name} placeholder="loans-api"
                onChange={(e) => setField('name', e.target.value.toLowerCase())} />
              <small className="muted">Identidad del componente — aparece en el manifest como components[].name</small>
            </label>
            <label className="field">
              <span>Nombre del repositorio</span>
              <input value={repoName} placeholder="mi-repo"
                onChange={(e) => { setRepoTouched(true); setField('repo', e.target.value); }} />
              <small className="muted">progmise/{repoName || '…'} — nombre libre</small>
            </label>
            <label className="field">
              <span>Descripción</span>
              <textarea rows="3" value={form.description}
                onChange={(e) => setField('description', e.target.value)} />
            </label>
          </div>
        )}

        {!result && step === 2 && (
          <div className="summary">
            <table className="summary-table">
              <tbody>
                <tr><td>Componente</td><td><strong>{form.name}</strong> <code>{form.name.toUpperCase().replace(/[^A-Z0-9]/g, '')}</code></td></tr>
                <tr><td>Repositorio</td><td>progmise/{repoName}</td></tr>
                <tr><td>Plantilla</td><td>{template.name} <span className="chip">{template.kind}</span></td></tr>
                <tr><td>Descripción</td><td>{form.description || '—'}</td></tr>
              </tbody>
            </table>
            <p className="muted">
              Se generará el repositorio desde la plantilla, se creará el proyecto Vercel,
              se configurarán secrets/variables y se abrirá un PR de registro en deploy-manifest.
            </p>
          </div>
        )}

        {result && (
          <div className="result">
            <p>{statusPill(result.status)}</p>
            <p>
              <a href={`https://github.com/${result.repo}`} target="_blank" rel="noreferrer">
                {result.repo} ↗
              </a>
              {result.manifest_pr
                ? <> · <a href={`https://github.com/progmise/deploy-manifest/pull/${result.manifest_pr}`}
                      target="_blank" rel="noreferrer">PR #{result.manifest_pr} ↗</a></>
                : null}
            </p>
            <ol className="prov-log">
              {(result.provision_log || []).map((e, i) => (
                <li key={i} className={e.ok ? '' : 'log-fail'}>
                  {STATUS_LABEL[e.step] || e.step} {!e.ok && `— ${e.error}`}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="modal-foot">
          {!result && step > 0 &&
            <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Atrás</button>}
          <span style={{ flex: 1 }} />
          {result
            ? result.status === 'failed'
              ? <button className="btn btn-primary" disabled={busy} onClick={retry}>
                  {busy ? 'Reintentando…' : 'Reintentar'}
                </button>
              : <button className="btn btn-primary" onClick={onClose}>Listo</button>
            : step === 0
              ? <button className="btn btn-primary" disabled={!template} onClick={() => setStep(1)}>Siguiente</button>
              : step === 1
                ? <button className="btn btn-primary" disabled={!nameOk || !repoOk} onClick={() => setStep(2)}>Siguiente</button>
                : <button className="btn btn-primary" disabled={busy} onClick={submit}>
                    {busy ? 'Creando…' : 'Crear componente'}
                  </button>}
        </div>
      </div>
    </div>
  );
}
