import { useEffect, useState } from 'react';

import type { DependencyList } from 'react';

/**
 * 마운트 해제 이후의 setState를 막아주는 loading/hasError 상태를 가진
 * 비동기 fetch effect 공통 훅. `enabled`가 false면 아무 것도 하지 않는다.
 * `run`은 언마운트 여부를 확인하는 `isMounted()`를 받아, 실제 setState 직전에
 * 직접 체크해야 한다(훅이 loading/hasError 갱신만 대신 처리한다).
 */
export function useAsyncEffect(
  run: (isMounted: () => boolean) => Promise<void>,
  deps: DependencyList,
  enabled = true,
) {
  const [loading, setLoading] = useState(enabled);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    const isMounted = () => mounted;

    void (async () => {
      await Promise.resolve();
      if (!isMounted()) return;

      setLoading(true);
      setHasError(false);

      try {
        await run(isMounted);
      } catch {
        if (isMounted()) setHasError(true);
      } finally {
        if (isMounted()) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { hasError, loading };
}
