import { useCallback, useMemo, useState } from 'react';

import { getPlaces } from '@/features/places/api';
import type {
  Place,
  PlaceCategory,
  PlaceQueryParams,
  PlaceTag,
} from '@/features/places/types';

interface UsePlaceSearchOptions {
  categories: PlaceCategory[];
  dogIds: number[];
  tags: PlaceTag[];
}

export function usePlaceSearch(options: UsePlaceSearchOptions) {
  const { categories, dogIds, tags } = options;
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const catalog = useMemo(() => ({ categories, tags }), [categories, tags]);

  const search = useCallback(
    async (params: PlaceQueryParams) => {
      const keyword = params.keyword?.trim();

      if (!keyword) {
        setResults(null);
        setHasError(false);
        return;
      }

      setLoading(true);
      setHasError(false);

      try {
        const nextPlaces = await getPlaces(
          {
            ...params,
            dogIds: params.dogIds ?? (dogIds.length > 0 ? dogIds : undefined),
            keyword,
            size: params.size ?? 50,
          },
          catalog,
        );
        setResults(nextPlaces);
      } catch {
        setHasError(true);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [catalog, dogIds],
  );

  const clear = useCallback(() => {
    setResults(null);
    setHasError(false);
  }, []);

  return { clear, hasError, loading, results, search };
}
