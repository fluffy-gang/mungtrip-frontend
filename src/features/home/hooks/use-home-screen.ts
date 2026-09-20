import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeatureIntegration } from '@/features/app-integration/context';
import { HEADER_CONTENT_HEIGHT, JEJU_MAP_BOUNDS } from '../constants';
import { areMapBoundsEqual } from '../utils/map-bounds';
import { filterPlaces } from '../utils/place-utils';
import { useCurrentLocation } from './use-current-location';
import { useHomeData } from './use-home-data';
import { useHomeBackHandler } from './use-home-back-handler';
import { useHomeViewer } from './use-home-viewer';
import { useMapSheetController } from './use-map-sheet-controller';
import { useMapZoom } from './use-map-zoom';
import { useRecentSearches } from './use-recent-searches';

import type { HomeMode, MapBounds, PlaceListSource } from '../types';
import type { Place, PlaceCategory } from '@/features/places/types';

export function useHomeScreen(initialMode: HomeMode = 'map') {
  const app = useFeatureIntegration();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [mode, setMode] = useState<HomeMode>(initialMode);
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
  const homeViewer = useHomeViewer(app.source === 'real');
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
  } = useHomeData(mapBounds, homeViewer.dogIds, app.catalog);

  const handleLocated = useCallback(() => {
    mapSheet.showMap();
    setMode('map');
  }, [mapSheet]);

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
  const isSearchList = listSource === 'search' && Boolean(query.trim());
  const updateMapBounds = useCallback(
    (nextBounds: MapBounds) => {
      setMapBounds(currentBounds => {
        if (areMapBoundsEqual(currentBounds, nextBounds)) {
          return currentBounds;
        }

        return nextBounds;
      });
    },
    [],
  );
  // Initial/programmatic camera-idle events must not discard a just-submitted search.
  const handleMapUserMove = useCallback(() => {
    if (!isSearchList) return;
    setQuery('');
    clearSearchResults();
    setListSource('recommendation');
  }, [clearSearchResults, isSearchList]);
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
  const { zoomIn, zoomOut } = useMapZoom(setMapCamera);
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

      if (!nextKeyword) {
        setQuery('');
        clearSearchResults();
        setSelectedPlace(null);
        setListSource('recommendation');
        mapSheet.showContentCollapsed();
        setMode('map');
        return;
      }

      setQuery(nextKeyword);
      setSelectedPlace(null);
      setListSource('search');
      mapSheet.showPlacesCollapsed();
      setMode('map');
      addRecentSearch(nextKeyword);
      void searchPlaces({ keyword: nextKeyword });
    },
    [addRecentSearch, clearSearchResults, mapSheet, searchPlaces],
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
    [clearSearchResults, mapSheet],
  );
  const showRecommendationList = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setListSource('recommendation');
    mapSheet.showPlacesExpanded();
    setMode('map');
  }, [clearSearchResults, mapSheet]);
  const showHomeFeed = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setSelectedCategoryCode(null);
    setListSource('recommendation');
    mapSheet.showContentCollapsed();
    setMode('map');
  }, [clearSearchResults, mapSheet]);
  const showMapView = useCallback(() => {
    mapSheet.showMap();
    setMode('map');
  }, [mapSheet]);
  const showProfile = useCallback(() => {
    router.navigate('/profile');
  }, [router]);
  const openSearch = useCallback(() => {
    setMode('search');
  }, []);
  const handleMapFloatingAction = useCallback(() => {
    if (mapSheet.isExpanded) {
      mapSheet.showMap();
    } else {
      mapSheet.toggleContent();
    }

    setSelectedPlace(null);
    setMode('map');
  }, [mapSheet]);
  const closeSearch = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setMode('map');
  }, [clearSearchResults]);
  const selectPlace = useCallback(
    (place: Place) => {
      // 상세로 바로 이동해 미리보기 카드가 한 프레임 노출되는 깜빡임을 막는다.
      router.push({
        params: { id: String(place.id) },
        pathname: '/places/[id]',
      });
    },
    [router],
  );
  const previewPlace = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      mapSheet.showMap();
      setMode('map');
    },
    [mapSheet],
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
    hasPlaceFilters: homeViewer.dogIds.length > 0 || !!activeCategoryCode || !!query.trim(),
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
    showProfile,
    showRecommendationList,
    submitSearch,
    topCafePlaces,
    topRestaurantPlaces,
    updateMapBounds,
    handleMapUserMove,
    userCoordinate,
    zoomControlBottom: mapSheet.zoomControlBottom,
    zoomIn,
    zoomOut,
    handleMapFloatingAction,
  };
}
