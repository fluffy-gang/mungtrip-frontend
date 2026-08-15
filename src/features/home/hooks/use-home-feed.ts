import { useEffect, useMemo, useState } from 'react';

import { getRecentlyVerifiedPlaces, getTopPlaces } from '@/features/places/api';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

import { DEFAULT_CATEGORY_CODE } from '../constants';

interface UseHomeFeedOptions {
  categories: PlaceCategory[];
  categoryCode: string | null;
  enabled: boolean;
  reloadKey: number;
  tags: PlaceTag[];
}

export function useHomeFeed(options: UseHomeFeedOptions) {
  const { categories, categoryCode, enabled, reloadKey, tags } = options;
  const [recentlyVerified, setRecentlyVerified] = useState<Place[]>([]);
  const [topPlaces, setTopPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const topCategoryCode = useMemo(
    () =>
      categoryCode && categories.some(category => category.code === categoryCode)
        ? categoryCode
        : (categories[0]?.code ?? DEFAULT_CATEGORY_CODE),
    [categories, categoryCode],
  );

  useEffect(() => {
    let isMounted = true;
    if (!enabled) return;

    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      setLoading(true);
      setHasError(false);

      try {
        const catalog = { categories, tags };
        const [nextRecentlyVerified, nextTopPlaces] = await Promise.all([
          getRecentlyVerifiedPlaces(10, catalog),
          getTopPlaces(
            { category: topCategoryCode, days: 30, limit: 10 },
            catalog,
          ),
        ]);

        if (isMounted) {
          setRecentlyVerified(nextRecentlyVerified);
          setTopPlaces(nextTopPlaces);
        }
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
  }, [categories, enabled, reloadKey, tags, topCategoryCode]);

  return { hasError, loading, recentlyVerified, topPlaces };
}
