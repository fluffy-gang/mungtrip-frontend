import { useState } from "react";

import { getCachedMapPlaces } from "@/features/places/map-places-cache";
import { useAsyncEffect } from "./use-async-effect";

import type { Place, PlaceCategory, PlaceTag } from "@/features/places/types";
import type { MapBounds } from "../types";

interface UseMapPlacesOptions {
  bounds: MapBounds;
  categories: PlaceCategory[];
  dogIds: number[];
  enabled: boolean;
  reloadKey: number;
  tags: PlaceTag[];
}

export function useMapPlaces(options: UseMapPlacesOptions) {
  const { bounds, categories, dogIds, enabled, reloadKey, tags } = options;
  const [places, setPlaces] = useState<Place[]>([]);

  const { hasError, loading } = useAsyncEffect(
    async (isMounted) => {
      const nextPlaces = await getCachedMapPlaces(
        {
          ...bounds,
          dogIds: dogIds.length > 0 ? dogIds : undefined,
          size: 50,
        },
        { categories, tags },
      );

      if (isMounted()) setPlaces(nextPlaces);
    },
    [bounds, categories, dogIds, enabled, reloadKey, tags],
    enabled,
  );

  return { hasError, loading, places };
}
