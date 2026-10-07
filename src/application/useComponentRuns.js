// Use case: last deploy runs of a single component repo.
import { useEffect, useState } from 'react';
import { getComponentRuns } from '../infrastructure/api/githubApi.js';

export const useComponentRuns = (repo) => {
  const [runs, setRuns] = useState(null);
  useEffect(() => {
    getComponentRuns(repo).then(setRuns).catch(() => setRuns([]));
  }, [repo]);
  return runs;
};
