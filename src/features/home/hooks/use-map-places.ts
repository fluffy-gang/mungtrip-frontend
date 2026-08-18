import { useState } from 'react';

import { getPlaces } from '@/features/places/api';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

import type { MapBounds } from '../types';
import { useAsyncEffect } from './use-async-effect';

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

  const { hasError, loading } = useAsyncEffect(
    async isMounted => {
      const nextPlaces = await getPlaces(
        {
          ...bounds,
          category: categoryCode ?? undefined,
          dogIds: dogIds.length > 0 ? dogIds : undefined,
          size: 50,
        },
        { categories, tags },
      );

      if (isMounted()) setPlaces(nextPlaces);
    },
    [bounds, categories, categoryCode, dogIds, enabled, reloadKey, tags],
    enabled,
  );

  return { hasError, loading, places };
}
