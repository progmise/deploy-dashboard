import { useState } from 'react';
import { useSession } from '../application/useSession.js';
import { useDashboardData } from '../application/useDashboardData.js';
import { filter } from '../domain/component.js';
import { CenterCard, SearchRow } from '../ui/components/Feedback.jsx';
import { Ico } from '../ui/components/Icons.jsx';
import { Login, Unauthorized, UserMenu } from '../ui/features/session/Gate.jsx';
import ReleasesTable from '../ui/features/releases/ReleasesTable.jsx';
import ComponentsTable from '../ui/features/components/ComponentsTable.jsx';
import DependencyGraph from '../ui/features/components/DependencyGraph.jsx';
import ComponentWizard from '../ui/features/components/ComponentWizard.jsx';
import OrchRuns from '../ui/features/deployments/OrchRuns.jsx';

const NAV = [
  { id: 'releases', label: 'Releases', icon: 'M20.59 13.41 12 22 2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01' },
  { id: 'componentes', label: 'Componentes', icon: 'M21 8 12 3 3 8v8l9 5 9-5V8z M3 8l9 5 9-5 M12 13v8' },
  { id: 'despliegues', label: 'Despliegues', icon: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' },
];

export default function App() {
  const me = useSession();
  const { manifest, releases, runs, catalog, error, reloadCatalog } = useDashboardData(me);
  const [wizard, setWizard] = useState(false);
  const [view, setView] = useState('releases');
  const [q, setQ] = useState('');

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
        <UserMenu user={me} />
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
              <ReleasesTable items={filter(releases, lower, ['name', 'tag_name'])} />
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
                <ComponentsTable manifest={manifest} catalog={catalog} q={lower}
                  onChanged={reloadCatalog} />
              </div>
              <div className="card">
                <h2>Grafo de dependencias</h2>
                <DependencyGraph components={manifest.components} />
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
      {wizard && <ComponentWizard onClose={() => setWizard(false)} onCreated={reloadCatalog} />}
    </>
  );
}
