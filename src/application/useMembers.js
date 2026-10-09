// Use case: team registry — loads members when the Equipo view mounts;
// reload after alta.
import { useCallback, useEffect, useState } from 'react';
import { getMembers } from '../infrastructure/api/catalogApi.js';

export const useMembers = (enabled) => {
  const [members, setMembers] = useState(null);
  const reload = useCallback(
    () => getMembers().then(setMembers).catch(() => setMembers([])),
    [],
  );
  useEffect(() => { if (enabled) reload(); }, [enabled, reload]);
  return { members, reload };
};
