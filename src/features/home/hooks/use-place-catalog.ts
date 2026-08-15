import { useEffect, useState } from 'react';

import {
  getPlaceCategories,
  getPlaceTags,
  getPopularKeywords,
} from '@/features/places/api';
import type { PlaceCategory, PlaceTag } from '@/features/places/types';

export function usePlaceCatalog(reloadKey: number) {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [tags, setTags] = useState<PlaceTag[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      await Promise.resolve();

      if (!isMounted) return;

      setLoading(true);
      setHasError(false);

      try {
        const [nextCategories, nextTags, nextPopularKeywords] = await Promise.all([
          getPlaceCategories(),
          getPlaceTags(),
          getPopularKeywords(),
        ]);

        if (isMounted) {
          setCategories(nextCategories);
          setTags(nextTags);
          setPopularKeywords(nextPopularKeywords);
          setIsLoaded(true);
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
  }, [reloadKey]);

  return { categories, hasError, isLoaded, loading, popularKeywords, tags };
}
