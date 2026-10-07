import { useEffect, useState } from 'react';
import { getMe, getManifest, getReleases, getOrchRuns, getComponents, retryProvision } from './api.js';
import { MermaidGraph, Releases, ComponentRuns, OrchRuns } from './components.jsx';
import { ComponentWizard, statusPill } from './wizard.jsx';

const GhIcon = (
  <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
  </svg>
);

const Ico = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const NAV = [
  { id: 'releases', label: 'Releases', icon: 'M20.59 13.41 12 22 2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01' },
  { id: 'componentes', label: 'Componentes', icon: 'M21 8 12 3 3 8v8l9 5 9-5V8z M3 8l9 5 9-5 M12 13v8' },
  { id: 'despliegues', label: 'Despliegues', icon: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' },
];

function CenterCard({ title, sub, children }) {
  return (
    <div className="center-page">
      <div className="login-card">
        <div className="logo-mark">⬡</div>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}

function Login() {
  return (
    <CenterCard title="Deploy Orchestrator" sub="progmise release orchestration">
      <a className="login-btn" href="/api/auth/login">{GhIcon} Sign in with GitHub</a>
    </CenterCard>
  );
}

function Unauthorized() {
  return (
    <CenterCard title="No autorizado" sub="Tu usuario de GitHub no tiene acceso a esta herramienta.">
      <a className="btn btn-outline" href="/api/logout">Cerrar sesión</a>
    </CenterCard>
  );
}

const filter = (items, q, keys) =>
  items.filter((i) => keys.some((k) => (i[k] || '').toLowerCase().includes(q)));

function SearchRow({ q, setQ, placeholder, action }) {
  return (
    <div className="search-row">
      <label className="search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6b7684" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
      </label>
      {action}
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState(undefined);
  const [manifest, setManifest] = useState(null);
  const [releases, setReleases] = useState([]);
  const [runs, setRuns] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [wizard, setWizard] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('releases');
  const [q, setQ] = useState('');

  const loadCatalog = () => getComponents().then(setCatalog).catch(() => setCatalog([]));

  useEffect(() => {
    getMe().then(setMe);
    const onAuth = () => setMe(null);
    window.addEventListener('auth:required', onAuth);
    return () => window.removeEventListener('auth:required', onAuth);
  }, []);

  useEffect(() => {
    if (!me || me.forbidden) return;
    Promise.all([
      getManifest(),
      getReleases().catch(() => []),
      getOrchRuns().catch(() => []),
    ])
      .then(([m, r, o]) => { setManifest(m); setReleases(r); setRuns(o); })
      .catch((e) => setError(e.message));
    loadCatalog();
  }, [me]);

  if (me === undefined) return <CenterCard title="Deploy Orchestrator" sub="Cargando…" />;
  if (me?.forbidden) return <Unauthorized />;
  if (!me) return <Login />;
  if (error) return <CenterCard title="Deploy Orchestrator" sub={error} />;
  if (!manifest) return <CenterCard title="Deploy Orchestrator" sub="Cargando…" />;

  const viewLabel = NAV.find((n) => n.id === view)?.label || '';
  const lower = q.toLowerCase();

  return (
    <>
      <div className="topbar">
        <span className="logo">
          <Ico d="M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" />
          ORCHESTRATOR
        </span>
        <span className="title">{viewLabel}</span>
        <div className="user">
          <img src={me.avatar_url} alt="" width="26" height="26" />
          <span>{me.login}</span>
          <a href="/api/logout">Salir</a>
        </div>
      </div>
      <div className="crumbs">
        <a href="/">⌂</a><span className="sep">/</span>
        <a href="/">progmise</a><span className="sep">/</span>
        <a href="https://github.com/progmise/deploy-manifest" target="_blank" rel="noreferrer">deploy-manifest</a>
        <span className="sep">/</span>
        <span>{viewLabel}</span>
        <span className="muted" style={{ marginLeft: 'auto' }}>
          release <code>v{manifest.version}</code>
        </span>
      </div>
      <div className="layout">
        <nav className="sidebar">
          {NAV.map((n) => (
            <a key={n.id} className={view === n.id ? 'active' : ''}
               onClick={() => { setView(n.id); setQ(''); }}>
              <Ico d={n.icon} />{n.label}
            </a>
          ))}
        </nav>
        <div className="content">

          {view === 'releases' && (
            <div className="card">
              <h2>Lista de releases</h2>
              <SearchRow q={q} setQ={setQ} placeholder="Buscar por nombre o versión…"
                action={
                  <a className="btn btn-primary" style={{ marginLeft: 'auto' }}
                     href="https://github.com/progmise/deploy-manifest/actions/workflows/release.yml"
                     target="_blank" rel="noreferrer">Nueva release +</a>
                } />
              <Releases items={filter(releases, lower, ['name', 'tag_name'])} />
            </div>
          )}

          {view === 'componentes' && (
            <>
              <div className="card">
                <h2>Componentes</h2>
                <SearchRow q={q} setQ={setQ} placeholder="Buscar componente…"
                  action={
                    <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
                      onClick={() => setWizard(true)}>Nuevo componente +</button>
                  } />
                <table>
                  <thead>
                    <tr><th>Nombre</th><th>Repo</th><th>Versión</th><th>Dependencias</th><th>Estado</th><th>Último deploy</th></tr>
                  </thead>
                  <tbody>
                    {[...manifest.components.map((c) => ({ ...c, db: catalog.find((d) => d.name === c.name) })),
                      ...catalog.filter((d) => !manifest.components.some((c) => c.name === d.name))
                        .map((d) => ({ name: d.name, repo: d.repo, tag: '—', needs: [], db: d }))]
                      .filter((c) => !lower || c.name.toLowerCase().includes(lower) || c.repo.toLowerCase().includes(lower))
                      .map((c) => (
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
                              {statusPill(c.db.status)}
                              {c.db.status === 'failed' &&
                                <button className="btn btn-outline" style={{ padding: '2px 10px', marginLeft: 8 }}
                                  onClick={() => retryProvision(c.name).then(loadCatalog).catch(loadCatalog)}>↻</button>}
                            </>
                          : <span className="pill outline">deployed</span>}</td>
                        <td><ComponentRuns repo={c.repo} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <h2>Grafo de dependencias</h2>
                <MermaidGraph components={manifest.components} />
              </div>
            </>
          )}

          {view === 'despliegues' && (
            <div className="card">
              <h2>Despliegues orquestados</h2>
              <SearchRow q={q} setQ={setQ} placeholder="Buscar run…" />
              <OrchRuns runs={filter(runs, lower, ['display_title'])} />
            </div>
          )}

        </div>
      </div>
      {wizard && <ComponentWizard onClose={() => setWizard(false)} onCreated={loadCatalog} />}
    </>
  );
}
