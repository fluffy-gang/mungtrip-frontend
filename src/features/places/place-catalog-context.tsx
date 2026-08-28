import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getPlaceCategories, getPlaceTags } from './api';
import type { PlaceCategory, PlaceTag } from './types';

interface PlaceCatalogContextValue {
  categories: PlaceCategory[];
  hasError: boolean;
  isLoaded: boolean;
  loading: boolean;
  retry: () => void;
  tags: PlaceTag[];
}

const unavailableCatalog: PlaceCatalogContextValue = {
  categories: [],
  hasError: true,
  isLoaded: false,
  loading: false,
  retry: () => undefined,
  tags: [],
};

const PlaceCatalogContext = createContext(unavailableCatalog);

/**
 * 장소 카테고리와 태그를 앱 생명주기 동안 한 번 조회해 홈과 상세가 공유한다.
 * Provider 밖에서는 상세 조회가 정적 fallback으로 계속 동작하도록 실패 상태를 반환한다.
 */
export function PlaceCatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [tags, setTags] = useState<PlaceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    void Promise.all([getPlaceCategories(), getPlaceTags()])
      .then(([nextCategories, nextTags]) => {
        if (!active) return;

        setCategories(nextCategories);
        setTags(nextTags);
        setIsLoaded(true);
      })
      .catch(() => {
        if (!active) return;

        setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setHasError(false);
    setIsLoaded(false);
    setReloadKey(value => value + 1);
  }, []);
  const value = useMemo(
    () => ({ categories, hasError, isLoaded, loading, retry, tags }),
    [categories, hasError, isLoaded, loading, retry, tags],
  );

  return (
    <PlaceCatalogContext.Provider value={value}>
      {children}
    </PlaceCatalogContext.Provider>
  );
}

export const usePlaceCatalogContext = () => useContext(PlaceCatalogContext);
