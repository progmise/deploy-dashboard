import { useEffect, useState } from 'react';
import { NAME_RE, REPO_RE, SHORTNAME_RE, STATUS_LABEL, shortnameFor,
  defaultConfig, configLabel } from '../../../domain/component.js';
import { getTemplates, createComponent, retryProvision } from '../../../infrastructure/api/catalogApi.js';
import { StatusPill } from '../../components/Feedback.jsx';

export default function ComponentWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState(null);
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', shortname: '', repo: '', description: '' });
  const [config, setConfig] = useState({});
  const [repoTouched, setRepoTouched] = useState(false);
  const [shortTouched, setShortTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getTemplates().then(setTemplates).catch((e) => setError(e.message));
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const repoName = repoTouched ? form.repo : form.name;
  const shortname = shortTouched ? form.shortname : shortnameFor(form.name);
  const nameOk = NAME_RE.test(form.name);
  const repoOk = REPO_RE.test(repoName);
  const shortOk = SHORTNAME_RE.test(shortname);
  const descOk = form.description.trim().length > 0;

  const pick = (t) => {
    setTemplate(t);
    setConfig(defaultConfig(t.fields));
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const c = await createComponent({
        ...form, shortname, repo: repoName, template: template.name, config,
      });
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
            {['Plantilla', 'Información', 'Personalización', 'Resumen'].map((l, i) => (
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
                  onClick={() => pick(t)}>
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
              <span>Nombre del componente *</span>
              <input value={form.name} placeholder="loans-api"
                onChange={(e) => setField('name', e.target.value.toLowerCase())} />
              <small className="muted">Identidad del componente — aparece en el manifest como components[].name</small>
            </label>
            <label className="field">
              <span>Nombre corto del componente *</span>
              <input value={shortname} placeholder="LOANSAPI"
                onChange={(e) => { setShortTouched(true); setField('shortname', e.target.value.toUpperCase()); }} />
              <small className="muted">Solo letras mayúsculas y dígitos — prefija los ids de infra del manifest</small>
            </label>
            <label className="field">
              <span>Descripción *</span>
              <textarea rows="3" value={form.description}
                onChange={(e) => setField('description', e.target.value)} />
              <small className="muted">Descripción funcional del componente</small>
            </label>
            <label className="field">
              <span>Nombre del repositorio *</span>
              <input value={repoName} placeholder="mi-repo"
                onChange={(e) => { setRepoTouched(true); setField('repo', e.target.value); }} />
              <small className="muted">progmise/{repoName || '…'} — nombre libre</small>
            </label>
          </div>
        )}

        {!result && step === 2 && (
          <div className="form">
            {(template.fields || []).map((f) => (
              <label key={f.key} className="field">
                <span>{f.label}</span>
                {f.type === 'select'
                  ? <select value={config[f.key] ?? f.default}
                      onChange={(e) => setConfig((c) => ({ ...c, [f.key]: e.target.value }))}>
                      {(f.options || []).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  : <input value={f.value} readOnly disabled />}
                {f.key === 'branch_strategy' && (
                  <small className="muted">
                    {config[f.key] === 'trunk'
                      ? 'Se crea solo main protegida'
                      : 'Se crean main y development protegidas (development = default)'}
                  </small>
                )}
              </label>
            ))}
          </div>
        )}

        {!result && step === 3 && (
          <div className="summary">
            <table className="summary-table">
              <tbody>
                <tr><td>Componente</td><td><strong>{form.name}</strong></td></tr>
                <tr><td>Nombre corto</td><td><code>{shortname}</code></td></tr>
                <tr><td>Repositorio</td><td>progmise/{repoName}</td></tr>
                <tr><td>Plantilla</td><td>{template.name} <span className="chip">{template.kind}</span></td></tr>
                <tr><td>Descripción</td><td>{form.description}</td></tr>
                {(template.fields || []).map((f) => (
                  <tr key={f.key}>
                    <td>{f.label}</td>
                    <td>{f.type === 'fixed' ? f.value : configLabel(template.fields, f.key, config[f.key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted">
              Se generará el repositorio desde la plantilla
              {config.branch_strategy === 'trunk'
                ? ' con main protegida'
                : ' con main y development protegidas'}
              , se configurarán secrets/variables
              {template.kind === 'app' && ' y se abrirá un PR de registro en deploy-manifest'}.
            </p>
          </div>
        )}

        {result && (
          <div className="result">
            <p><StatusPill status={result.status} /></p>
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
            : step < 3
              ? <button className="btn btn-primary"
                  disabled={(step === 0 && !template)
                    || (step === 1 && (!nameOk || !repoOk || !shortOk || !descOk))}
                  onClick={() => setStep(step + 1)}>Siguiente</button>
              : <button className="btn btn-primary" disabled={busy} onClick={submit}>
                  {busy ? 'Creando…' : 'Crear componente'}
                </button>}
        </div>
      </div>
    </div>
  );
}
