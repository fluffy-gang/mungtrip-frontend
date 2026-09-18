import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import {
  HEADER_CONTENT_HEIGHT,
  JEJU_MAP_BOUNDS,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_ZOOM_STEP,
} from '../constants';
import { areMapBoundsEqual } from '../utils/map-bounds';
import { filterPlaces } from '../utils/place-utils';
import { useCurrentLocation } from './use-current-location';
import { useHomeData } from './use-home-data';
import { useHomeMode } from './use-home-mode';
import { useHomeBackHandler } from './use-home-back-handler';
import { useHomeViewer } from './use-home-viewer';
import { useMapSheetController } from './use-map-sheet-controller';
import { useRecentSearches } from './use-recent-searches';

import type { MapBounds, PlaceListSource } from '../types';
import type { Place, PlaceCategory } from '@/features/places/types';

export function useHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const { mode, setMode } = useHomeMode();
  const [query, setQuery] = useState('');
  const [listSource, setListSource] = useState<PlaceListSource>('recommendation');
  const headerHeight = insets.top + HEADER_CONTENT_HEIGHT;
  const mapSheet = useMapSheetController({
    areaHeight: windowHeight - headerHeight,
    bottomInset: insets.bottom,
  });
  const [mapBounds, setMapBounds] = useState<MapBounds>(JEJU_MAP_BOUNDS);
  const [isDogSheetVisible, setIsDogSheetVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategoryCode, setSelectedCategoryCode] =
    useState<string | null>(null);
  const homeViewer = useHomeViewer();
  const { addRecentSearch, recentSearches, removeRecentSearch } =
    useRecentSearches();
  const {
    categories,
    clearSearchResults,
    courses,
    feedHasError,
    feedLoading,
    places,
    placesHasError,
    placesLoading,
    popularKeywords,
    recentlyVerified,
    retry,
    searchPlaces,
    searchResults,
    topCafePlaces,
    topRestaurantPlaces,
  } = useHomeData(mapBounds, homeViewer.dogIds);

  const handleLocated = useCallback(() => {
    mapSheet.showMap();
    setMode('map');
  }, [mapSheet, setMode]);

  const { mapCamera, moveToCurrentLocation, setMapCamera, userCoordinate } =
    useCurrentLocation({ onLocated: handleLocated });

  const activeCategoryCode =
    selectedCategoryCode &&
    categories.some(category => category.code === selectedCategoryCode)
      ? selectedCategoryCode
      : null;
  const selectedCategory = useMemo(
    () =>
      activeCategoryCode
        ? categories.find(category => category.code === activeCategoryCode)
        : undefined,
    [activeCategoryCode, categories],
  );
  const trimmedQuery = query.trim();
  const isSearchList = listSource === 'search' && Boolean(trimmedQuery);
  const updateMapBounds = useCallback(
    (nextBounds: MapBounds) => {
      setMapBounds(currentBounds => {
        if (areMapBoundsEqual(currentBounds, nextBounds)) {
          return currentBounds;
        }

        // 지도 이동 시 검색 결과 고정을 해제하고 위치 기준 목록으로 복귀한다.
        if (isSearchList) {
          setQuery('');
          clearSearchResults();
          setListSource('recommendation');
        }

        return nextBounds;
      });
    },
    [clearSearchResults, isSearchList],
  );
  const filterCategory = query.trim() ? undefined : selectedCategory;
  const filteredPlaces = useMemo(() => {
    if (isSearchList && searchResults) {
      return selectedCategory
        ? searchResults.filter(place => place.category === selectedCategory.code)
        : searchResults;
    }

    return filterPlaces(
      places,
      query,
      mode === 'search' ? undefined : filterCategory,
    );
  }, [filterCategory, isSearchList, mode, places, query, searchResults, selectedCategory]);
  const mapPlaces = useMemo(() => {
    if (!selectedPlace || places.some(place => place.id === selectedPlace.id)) {
      return places;
    }

    return [selectedPlace, ...places];
  }, [places, selectedPlace]);
  const updateMapZoom = useCallback(
    (zoomDelta: number) => {
      setMapCamera(currentCamera => ({
        ...currentCamera,
        zoom: Math.min(
          MAP_MAX_ZOOM,
          Math.max(MAP_MIN_ZOOM, currentCamera.zoom + zoomDelta),
        ),
      }));
    },
    [setMapCamera],
  );
  const zoomIn = useCallback(() => {
    updateMapZoom(MAP_ZOOM_STEP);
  }, [updateMapZoom]);
  const zoomOut = useCallback(() => {
    updateMapZoom(-MAP_ZOOM_STEP);
  }, [updateMapZoom]);
  const selectCategory = useCallback(
    (category: PlaceCategory) => {
      const isSameCategory = selectedCategoryCode === category.code;
      const nextCategoryCode = isSameCategory ? null : category.code;

      setSelectedPlace(null);
      setSelectedCategoryCode(nextCategoryCode);

      if (isSearchList) {
        // 검색 중에는 검색어/결과를 유지한 채 카테고리로만 좁힌다.
        return;
      }

      setListSource(nextCategoryCode ? 'category' : 'recommendation');

      // 피드에서 고른 경우만 필터 목록으로 전환하고 목록에서는 화면을 유지한다.
      if (!mapSheet.isPlaceList) {
        mapSheet.showPlacesCollapsed();
      }
    },
    [isSearchList, mapSheet, selectedCategoryCode],
  );
  const submitSearch = useCallback(
    (nextQuery: string) => {
      const nextKeyword = nextQuery.trim();

      setQuery(nextKeyword);
      setSelectedPlace(null);
      setListSource('search');
      mapSheet.showPlacesCollapsed();
      setMode('map');
      addRecentSearch(nextKeyword);
      void searchPlaces({ keyword: nextKeyword });
    },
    [addRecentSearch, mapSheet, searchPlaces, setMode],
  );
  const showCategoryPlaces = useCallback(
    (categoryCode: string) => {
      setQuery('');
      clearSearchResults();
      setSelectedPlace(null);
      setSelectedCategoryCode(categoryCode);
      setListSource('category');
      mapSheet.showPlacesExpanded();
      setMode('map');
    },
    [clearSearchResults, mapSheet, setMode],
  );
  const showRecommendationList = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setListSource('recommendation');
    mapSheet.showPlacesExpanded();
    setMode('map');
  }, [clearSearchResults, mapSheet, setMode]);
  const showHomeFeed = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setSelectedCategoryCode(null);
    setListSource('recommendation');
    mapSheet.showContentCollapsed();
    setMode('map');
  }, [clearSearchResults, mapSheet, setMode]);
  const showMapView = useCallback(() => {
    mapSheet.showMap();
    setMode('map');
  }, [mapSheet, setMode]);
  const openSearch = useCallback(() => {
    setMode('search');
  }, [setMode]);
  const handleMapFloatingAction = useCallback(() => {
    if (mapSheet.isExpanded) {
      mapSheet.showMap();
    } else {
      mapSheet.toggleContent();
    }

    setSelectedPlace(null);
    setMode('map');
  }, [mapSheet, setMode]);
  const closeSearch = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setMode('map');
  }, [clearSearchResults, setMode]);
  const selectPlace = useCallback(
    (place: Place) => {
      // 상세로 바로 이동해 미리보기 카드가 한 프레임 노출되는 깜빡임을 막는다.
      router.push({ pathname: '/places/[id]', params: { id: String(place.id) } });
    },
    [router],
  );
  const previewPlace = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      mapSheet.showMap();
      setMode('map');
    },
    [mapSheet, setMode],
  );
  const closeSelectedPlace = useCallback(() => {
    setSelectedPlace(null);
  }, []);
  const clearPlaceFilters = () => {
    homeViewer.saveDogSelection([]);
    setSelectedCategoryCode(null);
    closeSearch();
    setListSource('recommendation');
  };

  useHomeBackHandler({
    closePlacePreview: closeSelectedPlace,
    closeSearch,
    mode,
    selectedPlace,
  });

  return {
    activeCategoryCode,
    categories,
    clearPlaceFilters,
    hasPlaceFilters: homeViewer.dogIds.length > 0 || !!activeCategoryCode || !!trimmedQuery,
    closeSearch,
    closeSelectedPlace,
    courses,
    feedHasError,
    feedLoading,
    filteredPlaces,
    floatingActionBottom: mapSheet.floatingActionBottom,
    headerHeight,
    homeViewer,
    insets,
    isDogSheetVisible,
    isMapSheetPlaceList: mapSheet.isPlaceList,
    mapCamera,
    mapPlaces,
    mapFloatingActionIcon: mapSheet.floatingActionIcon,
    mapFloatingActionText: mapSheet.floatingActionText,
    mapSheetHeight: mapSheet.height,
    mapSheetPanHandlers: mapSheet.panHandlers,
    mode,
    moveToCurrentLocation,
    myLocationButtonBottom: mapSheet.myLocationButtonBottom,
    openSearch,
    places,
    placesHasError,
    placesLoading,
    popularKeywords,
    previewPlace,
    query,
    recentSearches,
    recentlyVerified,
    removeRecentSearch,
    retry,
    selectCategory,
    selectPlace,
    selectedCategory,
    selectedPlace,
    setIsDogSheetVisible,
    setMapCamera,
    setQuery,
    showCategoryPlaces,
    showHomeFeed,
    showMapView,
    showRecommendationList,
    submitSearch,
    topCafePlaces,
    topRestaurantPlaces,
    updateMapBounds,
    userCoordinate,
    zoomControlBottom: mapSheet.zoomControlBottom,
    zoomIn,
    zoomOut,
    handleMapFloatingAction,
  };
}
