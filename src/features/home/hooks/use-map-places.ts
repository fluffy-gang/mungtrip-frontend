import { useEffect, useState } from 'react';

import { getPlaces } from '@/features/places/api';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

import type { MapBounds } from '../types';

interface UseMapPlacesOptions {
  bounds: MapBounds;
  categories: PlaceCategory[];
  categoryCode: string | null;
  dogIds: number[];
  enabled: boolean;
  reloadKey: number;
  tags: PlaceTag[];
}

export function useMapPlaces(options: UseMapPlacesOptions) {
  const { bounds, categories, categoryCode, dogIds, enabled, reloadKey, tags } = options;
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!enabled) return;

    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      setLoading(true);
      setHasError(false);

      try {
        const nextPlaces = await getPlaces(
          {
            ...bounds,
            category: categoryCode ?? undefined,
            dogIds: dogIds.length > 0 ? dogIds : undefined,
            size: 50,
          },
          { categories, tags },
        );

        if (isMounted) setPlaces(nextPlaces);
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
  }, [bounds, categories, categoryCode, dogIds, enabled, reloadKey, tags]);

  return { hasError, loading, places };
}
