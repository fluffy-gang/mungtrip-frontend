import { useState } from 'react';

import { getCourses } from '@/features/courses/api';
import type { Course } from '@/features/courses/types';
import { getRecentlyVerifiedPlaces, getTopPlaces } from '@/features/places/api';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

import {
  MOCK_RECENTLY_VERIFIED_PLACES,
  MOCK_TOP_CAFE_PLACES,
  MOCK_TOP_RESTAURANT_PLACES,
} from '../mock/feed-places';
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
        // TODO(#10): dev 서버에 인증 데이터가 시딩되면 목데이터 폴백을 제거한다.
        setCourses(nextCourses);
        setRecentlyVerified(
          nextRecentlyVerified.length > 0
            ? nextRecentlyVerified
            : MOCK_RECENTLY_VERIFIED_PLACES,
        );
        setTopCafePlaces(
          nextTopCafePlaces.length > 0 ? nextTopCafePlaces : MOCK_TOP_CAFE_PLACES,
        );
        setTopRestaurantPlaces(
          nextTopRestaurantPlaces.length > 0
            ? nextTopRestaurantPlaces
            : MOCK_TOP_RESTAURANT_PLACES,
        );
      }
    },
    [categories, enabled, reloadKey, tags],
    enabled,
  );

  return { courses, hasError, loading, recentlyVerified, topCafePlaces, topRestaurantPlaces };
}
