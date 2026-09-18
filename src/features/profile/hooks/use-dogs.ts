import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { getMyDogs } from '@/features/dogs/api';
import { MOCK_DOGS } from '@/features/dogs/mock/dogs';

import type { Dog } from '@/features/dogs/types';

export function useDogs(enabled = true) {
  const isMockSession = useAuthStore(state => state.isMockSession);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      return;
    }

    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      // TODO(#11): 실제 로그인 화면(#9)이 머지되면 이 분기를 제거한다.
      if (isMockSession) {
        setDogs(MOCK_DOGS);
        setHasError(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasError(false);

      try {
        const nextDogs = await getMyDogs();
        if (isMounted) setDogs(nextDogs);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
  }, [enabled, isMockSession, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey(currentKey => currentKey + 1);
  }, []);

  return { dogs, hasError, loading, retry };
}
