import { useState } from 'react';

import {
  getPlaceCategories,
  getPlaceTags,
  getPopularKeywords,
} from '@/features/places/api';
import { useAsyncEffect } from './use-async-effect';

import type { PlaceCategory, PlaceTag } from '@/features/places/types';


export function usePlaceCatalog(reloadKey: number, enabled = true) {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [tags, setTags] = useState<PlaceTag[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { hasError, loading } = useAsyncEffect(
    async isMounted => {
      setIsLoaded(false);

      const [nextCategories, nextTags] = await Promise.all([
        getPlaceCategories(),
        getPlaceTags(),
      ]);
      // Popular search terms enrich only the search sheet. A failure there must
      // not prevent the map and feed from rendering with their core catalog.
      const nextPopularKeywords = await getPopularKeywords().catch(() => []);

      if (isMounted()) {
        setCategories(nextCategories);
        setTags(nextTags);
        setPopularKeywords(nextPopularKeywords);
        setIsLoaded(true);
      }
    },
    [reloadKey, enabled],
    enabled,
  );

  return { categories, hasError, isLoaded, loading, popularKeywords, tags };
}
