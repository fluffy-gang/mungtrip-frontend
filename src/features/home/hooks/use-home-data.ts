import { useCallback, useState } from 'react';

import { JEJU_MAP_BOUNDS } from '../constants';
import type { MapBounds } from '../types';
import { useHomeFeed } from './use-home-feed';
import { useMapPlaces } from './use-map-places';
import { usePlaceCatalog } from './use-place-catalog';
import { usePlaceSearch } from './use-place-search';

export function useHomeData(
  selectedCategoryCode: string | null = null,
  mapBounds: MapBounds = JEJU_MAP_BOUNDS,
  dogIds: number[] = [],
) {
  const [reloadKey, setReloadKey] = useState(0);
  const catalog = usePlaceCatalog(reloadKey);
  const mapPlaces = useMapPlaces({
    bounds: mapBounds,
    categories: catalog.categories,
    categoryCode: selectedCategoryCode,
    dogIds,
    enabled: catalog.isLoaded,
    reloadKey,
    tags: catalog.tags,
  });
  const feed = useHomeFeed({
    categories: catalog.categories,
    enabled: catalog.isLoaded,
    reloadKey,
    tags: catalog.tags,
  });
  const search = usePlaceSearch({
    categories: catalog.categories,
    dogIds,
    tags: catalog.tags,
  });
  const retry = useCallback(() => {
    setReloadKey(currentKey => currentKey + 1);
  }, []);

  return {
    categories: catalog.categories,
    clearSearchResults: search.clear,
    courses: feed.courses,
    hasError: catalog.hasError || mapPlaces.hasError || feed.hasError,
    loading: catalog.loading || mapPlaces.loading || feed.loading,
    places: mapPlaces.places,
    popularKeywords: catalog.popularKeywords,
    recentlyVerified: feed.recentlyVerified,
    retry,
    searchPlaces: search.search,
    searchResults: search.results,
    tags: catalog.tags,
    topCafePlaces: feed.topCafePlaces,
    topRestaurantPlaces: feed.topRestaurantPlaces,
  };
}
