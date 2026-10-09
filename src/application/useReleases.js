// Use case: release registry — the list loads when the Releases view mounts;
// the detail refreshes on demand (each read re-polls open runs server-side).
import { useCallback, useEffect, useState } from 'react';
import { getReleases, getRelease } from '../infrastructure/api/catalogApi.js';

export const useReleases = (enabled) => {
  const [releases, setReleases] = useState(null);
  const reload = useCallback(
    () => getReleases().then(setReleases).catch(() => setReleases([])),
    [],
  );
  useEffect(() => { if (enabled) reload(); }, [enabled, reload]);
  return { releases, reload };
};

export const useReleaseDetail = (number) => {
  const [release, setRelease] = useState(null);
  const [error, setError] = useState(null);
  const reload = useCallback(() => {
    if (number == null) return Promise.resolve();
    return getRelease(number).then(setRelease).catch((e) => setError(e.message));
  }, [number]);
  useEffect(() => { reload(); }, [reload]);
  return { release, error, reload };
};
