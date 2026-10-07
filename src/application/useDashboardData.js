// Use case: dashboard data — manifest + releases + orchestration runs load
// once a session is confirmed; the component catalog reloads on demand.
import { useCallback, useEffect, useState } from 'react';
import { getManifest, getReleases, getOrchRuns } from '../infrastructure/api/githubApi.js';
import { getComponents } from '../infrastructure/api/catalogApi.js';

export const useDashboardData = (me) => {
  const [manifest, setManifest] = useState(null);
  const [releases, setReleases] = useState([]);
  const [runs, setRuns] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState(null);

  const reloadCatalog = useCallback(
    () => getComponents().then(setCatalog).catch(() => setCatalog([])),
    [],
  );

  useEffect(() => {
    if (!me || me.forbidden) return;
    Promise.all([
      getManifest(),
      getReleases().catch(() => []),
      getOrchRuns().catch(() => []),
    ])
      .then(([m, r, o]) => { setManifest(m); setReleases(r); setRuns(o); })
      .catch((e) => setError(e.message));
    reloadCatalog();
  }, [me, reloadCatalog]);

  return { manifest, releases, runs, catalog, error, reloadCatalog };
};
