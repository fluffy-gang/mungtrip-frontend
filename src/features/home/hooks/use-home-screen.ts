import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place, PlaceCategory } from '@/features/places/types';

import {
  HEADER_CONTENT_HEIGHT,
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
import { useRecentSearches } from './use-recent-searches';

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
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [mode, setMode] = useState<HomeMode>('map');
  const [query, setQuery] = useState('');
  const [listSource, setListSource] =
    useState<PlaceListSource>('recommendation');
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
  const trimmedQuery = query.trim();
  const isSearchList = listSource === 'search' && Boolean(trimmedQuery);
  const updateMapBounds = useCallback(
    (nextBounds: MapBounds) => {
      setMapBounds(currentBounds => {
        if (areMapBoundsEqual(currentBounds, nextBounds)) {
          return currentBounds;
        }

        // 사용자가 지도를 직접 움직이면 이전 검색 결과 고정을 풀고
        // 다시 위치 기준 목록을 보여준다.
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

      // 콘텐츠(피드) 화면에서 고른 경우에만 필터링된 리스트로 전환한다.
      // 이미 리스트 화면이면(선택이든 해제든) 화면 전환 없이 필터만 바뀐다.
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
    [addRecentSearch, mapSheet, searchPlaces],
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
      // 상세로 바로 이동하는 흐름이라 미리보기 카드(selectedPlace)를 거치지 않는다.
      // 여기서 selectedPlace를 세팅하면 전환되는 한 프레임 동안 바텀시트가
      // PlacePreviewCard로 바뀌었다 사라지는 깜빡임이 생긴다.
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

  // 안드로이드 하드웨어 뒤로가기가 검색/장소 미리보기 오버레이를 건너뛰고
  // 바로 앱을 종료시키지 않도록, 열려있는 오버레이부터 닫는다.
  // 홈 화면이 포커스된 동안에만 등록해야, 상세 화면으로 push된 뒤에도
  // 백그라운드의 홈 리스너가 뒤로가기를 가로채 스택 pop을 막는 것을 방지한다.
  useFocusEffect(
    useCallback(() => {
      if (mode !== 'search' && !selectedPlace) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (mode === 'search') {
            closeSearch();
          } else {
            closeSelectedPlace();
          }

          return true;
        },
      );

      return () => subscription.remove();
    }, [mode, selectedPlace, closeSearch, closeSelectedPlace]),
  );

  return {
    activeCategoryCode,
    categories,
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
