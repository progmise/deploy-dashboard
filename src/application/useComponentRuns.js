// Use case: last runs of a component repo — deploy.yml for apps,
// release.yml for libs (they publish, not deploy).
import { useEffect, useState } from 'react';
import { getComponentRuns } from '../infrastructure/api/githubApi.js';

export const useComponentRuns = (repo, workflow = 'deploy.yml') => {
  const [runs, setRuns] = useState(null);
  useEffect(() => {
    getComponentRuns(repo, workflow).then(setRuns).catch(() => setRuns([]));
  }, [repo, workflow]);
  return runs;
};
