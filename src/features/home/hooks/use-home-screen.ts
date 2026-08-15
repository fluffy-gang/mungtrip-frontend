import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place, PlaceCategory } from '@/features/places/types';

import {
  JEJU_MAP_BOUNDS,
  MAP_BOUNDS_EPSILON,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_ZOOM_STEP,
} from '../constants';
import type { HomeMode, MapBounds, PlaceListSource } from '../types';
import { filterPlaces } from '../utils/place-utils';
import { useCurrentLocation } from './use-current-location';
import { useHomeData } from './use-home-data';
import { useHomeViewer } from './use-home-viewer';
import { useMapSheetController } from './use-map-sheet-controller';

const areMapBoundsEqual = (firstBounds: MapBounds, secondBounds: MapBounds) => {
  return (
    Math.abs(firstBounds.swLng - secondBounds.swLng) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.swLat - secondBounds.swLat) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.neLng - secondBounds.neLng) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.neLat - secondBounds.neLat) < MAP_BOUNDS_EPSILON
  );
};

export function useHomeScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mode, setMode] = useState<HomeMode>('map');
  const [query, setQuery] = useState('');
  const [listSource, setListSource] =
    useState<PlaceListSource>('recommendation');
  const mapSheet = useMapSheetController({
    bottomInset: insets.bottom,
    topInset: insets.top,
    windowHeight,
  });
  const [mapBounds, setMapBounds] = useState<MapBounds>(JEJU_MAP_BOUNDS);
  const [isDogSheetVisible, setIsDogSheetVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategoryCode, setSelectedCategoryCode] =
    useState<string | null>(null);
  const homeViewer = useHomeViewer();
  const apiDogIds = useMemo(
    () => (homeViewer.isLoggedIn ? homeViewer.dogIds : []),
    [homeViewer.dogIds, homeViewer.isLoggedIn],
  );
  const {
    categories,
    clearSearchResults,
    hasError,
    loading,
    places,
    popularKeywords,
    recentlyVerified,
    retry,
    searchPlaces,
    searchResults,
    topPlaces,
  } = useHomeData(selectedCategoryCode, mapBounds, apiDogIds);

  const handleLocated = useCallback(() => {
    mapSheet.showMap();
    setMode('map');
  }, [mapSheet]);

  const { mapCamera, moveToCurrentLocation, setMapCamera, userCoordinate } =
    useCurrentLocation({ onLocated: handleLocated });
  const updateMapBounds = useCallback((nextBounds: MapBounds) => {
    setMapBounds(currentBounds =>
      areMapBoundsEqual(currentBounds, nextBounds)
        ? currentBounds
        : nextBounds,
    );
  }, []);

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
  const isSearchList =
    mode === 'list' && listSource === 'search' && Boolean(trimmedQuery);
  const filterCategory = query.trim() ? undefined : selectedCategory;
  const filteredPlaces = useMemo(() => {
    if (isSearchList && searchResults) {
      return searchResults;
    }

    return filterPlaces(
      places,
      query,
      mode === 'search' ? undefined : filterCategory,
    );
  }, [filterCategory, isSearchList, mode, places, query, searchResults]);
  const mapPlaces = useMemo(() => {
    if (!selectedPlace || places.some(place => place.id === selectedPlace.id)) {
      return places;
    }

    return [selectedPlace, ...places];
  }, [places, selectedPlace]);
  const isCategoryMap =
    mode === 'map' && listSource === 'category' && Boolean(selectedCategory);
  const sheetTitle = (() => {
    if (mode === 'map' && selectedPlace) {
      return selectedPlace.name;
    }

    if (mode === 'list' && listSource === 'category') {
      return selectedCategory ? `${selectedCategory.name} 리스트` : '장소 리스트';
    }

    if (isCategoryMap) {
      return `${selectedCategory?.name ?? '장소'} 지도 보기`;
    }

    return '제주 지역별 추천 코스';
  })();
  const sheetLabel =
    mode === 'map' && selectedPlace
      ? `${selectedPlace.categoryName} · ${selectedPlace.address}`
      : `${filteredPlaces.length}개 장소`;

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

      setQuery('');
      clearSearchResults();
      setSelectedPlace(null);
      setListSource(isSameCategory ? 'recommendation' : 'category');
      setSelectedCategoryCode(isSameCategory ? null : category.code);
      if (isSameCategory) {
        mapSheet.showContentCollapsed();
      } else {
        mapSheet.showPlacesCollapsed();
      }
      setMode('map');
    },
    [clearSearchResults, mapSheet, selectedCategoryCode],
  );
  const submitSearch = useCallback(
    (nextQuery: string) => {
      const nextKeyword = nextQuery.trim();

      setQuery(nextKeyword);
      setSelectedPlace(null);
      setListSource('search');
      setMode('list');
      void searchPlaces({ keyword: nextKeyword });
    },
    [searchPlaces],
  );
  const showCategoryList = useCallback(() => {
    setQuery('');
    clearSearchResults();
    setSelectedPlace(null);
    setListSource('category');
    mapSheet.showPlacesExpanded();
    setMode('map');
  }, [clearSearchResults, mapSheet]);
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
  const openSearch = useCallback(() => {
    setMode('search');
  }, []);
  const handleMapFloatingAction = useCallback(() => {
    mapSheet.toggleContent();
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
      setQuery('');
      clearSearchResults();
      setSelectedPlace(place);
      mapSheet.showMap();
      setMode('map');
    },
    [clearSearchResults, mapSheet],
  );

  return {
    activeCategoryCode,
    categories,
    closeSearch,
    filteredPlaces,
    floatingActionBottom: mapSheet.floatingActionBottom,
    hasError,
    homeViewer,
    insets,
    isDogSheetVisible,
    isMapSheetPlaceList: mapSheet.isPlaceList,
    loading,
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
    popularKeywords,
    query,
    recentlyVerified,
    retry,
    selectCategory,
    selectPlace,
    selectedCategory,
    selectedPlace,
    setIsDogSheetVisible,
    setMapCamera,
    setQuery,
    sheetLabel,
    sheetTitle,
    showCategoryList,
    showHomeFeed,
    showMapView,
    showRecommendationList,
    submitSearch,
    topPlaces,
    updateMapBounds,
    userCoordinate,
    zoomControlBottom: mapSheet.zoomControlBottom,
    zoomIn,
    zoomOut,
    handleMapFloatingAction,
  };
}
