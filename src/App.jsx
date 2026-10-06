import { useEffect, useState } from 'react';
import { getManifest, getReleases, getOrchRuns } from './api.js';
import { MermaidGraph, Releases, ComponentRuns, OrchRuns, TokenBox } from './components.jsx';

export default function App() {
  const [manifest, setManifest] = useState(null);
  const [releases, setReleases] = useState([]);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getManifest(),
      getReleases().catch(() => []),
      getOrchRuns().catch(() => []),
    ])
      .then(([m, r, o]) => { setManifest(m); setReleases(r); setRuns(o); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <main><h1>Deploy Dashboard</h1><p className="fail">{error}</p></main>;
  if (!manifest) return <main><h1>Deploy Dashboard</h1><p>Loading…</p></main>;

  return (
    <main>
      <header>
        <h1>Deploy Dashboard</h1>
        <p className="muted">
          manifest <a href="https://github.com/progmise/deploy-manifest">progmise/deploy-manifest</a>
          {' '}· release <code>v{manifest.version}</code>
        </p>
      </header>

      <section>
        <h2>Components</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Repo</th><th>Tag</th><th>Needs</th><th>Last deploy</th></tr>
          </thead>
          <tbody>
            {manifest.components.map((c) => (
              <tr key={c.name}>
                <td><code>{c.name}</code></td>
                <td><a href={`https://github.com/${c.repo}`}>{c.repo}</a></td>
                <td><code>{c.tag}</code></td>
                <td>{(c.needs || []).join(', ') || '—'}</td>
                <td><ComponentRuns repo={c.repo} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <MermaidGraph components={manifest.components} />
      </section>

      <section>
        <h2>Releases</h2>
        <Releases items={releases} />
      </section>

      <section>
        <h2>Orchestrated deploys</h2>
        <OrchRuns runs={runs} />
      </section>

      <TokenBox />
    </main>
  );
}
