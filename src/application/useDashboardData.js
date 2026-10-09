// Use case: dashboard data — manifest + releases + orchestration runs load
// once a session is confirmed; the component catalog reloads on demand.
import { useCallback, useEffect, useState } from 'react';
import { getManifest, getOrchRuns } from '../infrastructure/api/githubApi.js';
import { getComponents, getTemplates } from '../infrastructure/api/catalogApi.js';

export const useDashboardData = (me) => {
  const [manifest, setManifest] = useState(null);
  const [runs, setRuns] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);

  const reloadCatalog = useCallback(
    () => getComponents().then(setCatalog).catch(() => setCatalog([])),
    [],
  );

  useEffect(() => {
    if (!me || me.forbidden) return;
    Promise.all([
      getManifest(),
      getOrchRuns().catch(() => []),
    ])
      .then(([m, o]) => { setManifest(m); setRuns(o); })
      .catch((e) => setError(e.message));
    reloadCatalog();
    getTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, [me, reloadCatalog]);

  return { manifest, runs, catalog, templates, error, reloadCatalog };
};
