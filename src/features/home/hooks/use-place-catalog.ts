import { useState } from 'react';

import {
  getPlaceCategories,
  getPlaceTags,
  getPopularKeywords,
} from '@/features/places/api';
import { useAsyncEffect } from './use-async-effect';

import type { PlaceCategory, PlaceTag } from '@/features/places/types';


export function usePlaceCatalog(reloadKey: number) {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [tags, setTags] = useState<PlaceTag[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { hasError, loading } = useAsyncEffect(
    async isMounted => {
      setIsLoaded(false);

      const [nextCategories, nextTags, nextPopularKeywords] = await Promise.all([
        getPlaceCategories(),
        getPlaceTags(),
        getPopularKeywords(),
      ]);

      if (isMounted()) {
        setCategories(nextCategories);
        setTags(nextTags);
        setPopularKeywords(nextPopularKeywords);
        setIsLoaded(true);
      }
    },
    [reloadKey],
  );

  return { categories, hasError, isLoaded, loading, popularKeywords, tags };
}
