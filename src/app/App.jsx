import { useState } from 'react';
import { useSession } from '../application/useSession.js';
import { useDashboardData } from '../application/useDashboardData.js';
import { filter } from '../domain/component.js';
import { CenterCard, SearchRow } from '../ui/components/Feedback.jsx';
import { Ico, ICON } from '../ui/components/Icons.jsx';
import { Login, Unauthorized, UserMenu } from '../ui/features/session/Gate.jsx';
import ReleasesTable from '../ui/features/releases/ReleasesTable.jsx';
import ComponentsTable from '../ui/features/components/ComponentsTable.jsx';
import FiltersMenu from '../ui/features/components/FiltersMenu.jsx';
import DependencyGraph from '../ui/features/components/DependencyGraph.jsx';
import ComponentWizard from '../ui/features/components/ComponentWizard.jsx';
import TemplateGallery from '../ui/features/components/TemplateGallery.jsx';
import OrchRuns from '../ui/features/deployments/OrchRuns.jsx';

const NAV = [
  { id: 'releases', label: 'Releases', icon: ICON.releases },
  { id: 'componentes', label: 'Componentes', icon: ICON.componentes },
  { id: 'despliegues', label: 'Despliegues', icon: ICON.despliegues },
];

export default function App() {
  const me = useSession();
  const { manifest, releases, runs, catalog, templates, error, reloadCatalog } = useDashboardData(me);
  const [wizardTemplate, setWizardTemplate] = useState(null);
  const [view, setView] = useState('releases');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ plantilla: '', estado: '' });
  const [collapsed, setCollapsed] = useState(false);

  if (me === undefined) return <CenterCard title="Deploy Orchestrator" sub="Cargando…" />;
  if (me?.forbidden) return <Unauthorized />;
  if (!me) return <Login />;
  if (error) return <CenterCard title="Deploy Orchestrator" sub={error} />;
  if (!manifest) return <CenterCard title="Deploy Orchestrator" sub="Cargando…" />;

  const viewLabel = view === 'nuevo-componente'
    ? 'Componentes / Nuevo componente'
    : NAV.find((n) => n.id === view)?.label || '';
  const lower = q.toLowerCase();

  return (
    <>
      <div className="topbar">
        <span className="logo">
          <Ico d={ICON.logo} />
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
        <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
          {NAV.map((n) => (
            <a key={n.id} className={view === n.id ? 'active' : ''} title={n.label}
               onClick={() => { setView(n.id); setQ(''); }}>
              <Ico d={n.icon} />{!collapsed && n.label}
            </a>
          ))}
          <button className="sidebar-toggle" onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expandir' : 'Colapsar'}>{collapsed ? '›' : '‹'}</button>
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
                <h2>Buscar componente</h2>
                <SearchRow q={q} setQ={setQ} placeholder="Mi componente favorito"
                  action={
                    <>
                      <FiltersMenu templates={templates} filters={filters} setFilters={setFilters} />
                      <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
                        onClick={() => { setView('nuevo-componente'); setQ(''); }}>Nuevo componente +</button>
                    </>
                  } />
                <p className="muted" style={{ fontSize: 12, margin: '-8px 0 14px' }}>
                  Buscar por nombre, nombre corto o plantilla</p>
                <ComponentsTable manifest={manifest} catalog={catalog} templates={templates}
                  q={lower} filters={filters} onChanged={reloadCatalog} />
              </div>
              <div className="card">
                <h2>Grafo de dependencias</h2>
                <DependencyGraph components={manifest.components} />
              </div>
            </>
          )}

          {view === 'nuevo-componente' && (
            <TemplateGallery templates={templates} onPick={setWizardTemplate} />
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
      {wizardTemplate && (
        <ComponentWizard template={wizardTemplate}
          onClose={() => setWizardTemplate(null)}
          onBack={() => setWizardTemplate(null)}
          onCreated={reloadCatalog} />
      )}
    </>
  );
}
