// Use case: current session — resolves the signed-in user and reacts to the
// api client's auth:required signal (any 401 logs the view out).
import { useEffect, useState } from 'react';
import { getMe } from '../infrastructure/api/sessionApi.js';

export const useSession = () => {
  const [me, setMe] = useState(undefined);
  useEffect(() => {
    getMe().then(setMe);
    const onAuth = () => setMe(null);
    window.addEventListener('auth:required', onAuth);
    return () => window.removeEventListener('auth:required', onAuth);
  }, []);
  return me;
};
