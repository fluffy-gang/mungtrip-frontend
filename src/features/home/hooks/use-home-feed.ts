import { useState } from 'react';

import { getCourses } from '@/features/courses/api';
import { getRecentlyVerifiedPlaces, getTopPlaces } from '@/features/places/api';
import { useAsyncEffect } from './use-async-effect';

import type { Course } from '@/features/courses/types';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';


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
        await Promise.allSettled([
          getCourses(10),
          getRecentlyVerifiedPlaces(10, catalog),
          getTopPlaces({ category: 'CAFE', days: 30, limit: 10 }, catalog),
          getTopPlaces({ category: 'RESTAURANT', days: 30, limit: 10 }, catalog),
        ]);

      if (isMounted()) {
        if (nextCourses.status === 'fulfilled') setCourses(nextCourses.value);
        if (nextRecentlyVerified.status === 'fulfilled') setRecentlyVerified(nextRecentlyVerified.value);
        if (nextTopCafePlaces.status === 'fulfilled') setTopCafePlaces(nextTopCafePlaces.value);
        if (nextTopRestaurantPlaces.status === 'fulfilled') setTopRestaurantPlaces(nextTopRestaurantPlaces.value);

        if (
          nextCourses.status === 'rejected' &&
          nextRecentlyVerified.status === 'rejected' &&
          nextTopCafePlaces.status === 'rejected' &&
          nextTopRestaurantPlaces.status === 'rejected'
        ) {
          throw new Error('All home feed requests failed.');
        }
      }
    },
    [categories, enabled, reloadKey, tags],
    enabled,
  );

  return { courses, hasError, loading, recentlyVerified, topCafePlaces, topRestaurantPlaces };
}
