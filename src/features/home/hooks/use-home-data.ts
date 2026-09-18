import { useCallback, useState } from "react";

import { JEJU_MAP_BOUNDS } from "../constants";
import { useHomeFeed } from "./use-home-feed";
import { useMapPlaces } from "./use-map-places";
import { usePlaceCatalog } from "./use-place-catalog";
import { usePlaceSearch } from "./use-place-search";

import type { MapBounds } from "../types";

export function useHomeData(
  mapBounds: MapBounds = JEJU_MAP_BOUNDS,
  dogIds: number[] = [],
) {
  const [reloadKey, setReloadKey] = useState(0);
  const catalog = usePlaceCatalog(reloadKey);
  const mapPlaces = useMapPlaces({
    bounds: mapBounds,
    categories: catalog.categories,
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
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  return {
    categories: catalog.categories,
    clearSearchResults: search.clear,
    courses: feed.courses,

    feedHasError: catalog.hasError || feed.hasError,
    feedLoading: catalog.loading || feed.loading,
    places: mapPlaces.places,
    placesHasError: catalog.hasError || mapPlaces.hasError,
    placesLoading: catalog.loading || mapPlaces.loading,
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
