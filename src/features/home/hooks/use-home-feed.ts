import { useState } from 'react';

import { getCourses } from '@/features/courses/api';
import type { Course } from '@/features/courses/types';
import { getRecentlyVerifiedPlaces, getTopPlaces } from '@/features/places/api';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

import { useAsyncEffect } from './use-async-effect';

interface UseHomeFeedOptions {
  categories: PlaceCategory[];
  enabled: boolean;
  reloadKey: number;
  tags: PlaceTag[];
}

export function useHomeFeed(options: UseHomeFeedOptions) {
  const { categories, enabled, reloadKey, tags } = options;
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentlyVerified, setRecentlyVerified] = useState<Place[]>([]);
  const [topCafePlaces, setTopCafePlaces] = useState<Place[]>([]);
  const [topRestaurantPlaces, setTopRestaurantPlaces] = useState<Place[]>([]);

  const { hasError, loading } = useAsyncEffect(
    async isMounted => {
      const catalog = { categories, tags };
      const [nextCourses, nextRecentlyVerified, nextTopCafePlaces, nextTopRestaurantPlaces] =
        await Promise.all([
          getCourses(10),
          getRecentlyVerifiedPlaces(10, catalog),
          getTopPlaces({ category: 'CAFE', days: 30, limit: 10 }, catalog),
          getTopPlaces({ category: 'RESTAURANT', days: 30, limit: 10 }, catalog),
        ]);

      if (isMounted()) {
        setCourses(nextCourses);
        setRecentlyVerified(nextRecentlyVerified);
        setTopCafePlaces(nextTopCafePlaces);
        setTopRestaurantPlaces(nextTopRestaurantPlaces);
      }
    },
    [categories, enabled, reloadKey, tags],
    enabled,
  );

  return { courses, hasError, loading, recentlyVerified, topCafePlaces, topRestaurantPlaces };
}
