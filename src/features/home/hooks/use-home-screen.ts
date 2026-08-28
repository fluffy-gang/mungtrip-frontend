import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place, PlaceCategory } from '@/features/places/types';

import {
  HEADER_CONTENT_HEIGHT,
  JEJU_MAP_BOUNDS,
  JEJU_MAP_CAMERA,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_ZOOM_STEP,
} from '../constants';
import type { HomeMode, MapBounds } from '../types';
import { areMapBoundsEqual } from '../utils/map-utils';
import { useMapSheetController } from './use-map-sheet-controller';
import { usePlaceCatalog } from './use-place-catalog';
import { usePlaceExploration } from './use-place-exploration';

export function useHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [mode, setMode] = useState<HomeMode>('map');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [committedBounds, setCommittedBounds] =
    useState<MapBounds>(JEJU_MAP_BOUNDS);
  const [draftBounds, setDraftBounds] = useState<MapBounds>(JEJU_MAP_BOUNDS);
  const [mapCamera, setMapCamera] = useState(JEJU_MAP_CAMERA);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const headerHeight = insets.top + HEADER_CONTENT_HEIGHT;
  const mapSheet = useMapSheetController({
    areaHeight: windowHeight - headerHeight - insets.bottom,
  });
  const catalog = usePlaceCatalog();
  const exploration = usePlaceExploration({
    bounds: committedBounds,
    categories: catalog.categories,
    category,
    enabled: catalog.isLoaded,
    keyword,
    tag,
    tags: catalog.tags,
  });
  const selectedPlace = useMemo(
    () => exploration.results.find(place => place.id === selectedPlaceId) ?? null,
    [exploration.results, selectedPlaceId],
  );
  const hasDraftBounds = !areMapBoundsEqual(draftBounds, committedBounds);

  const selectCategory = useCallback((nextCategory: PlaceCategory) => {
    setCategory(current =>
      current === nextCategory.code ? null : nextCategory.code,
    );
    setSelectedPlaceId(null);
    mapSheet.showPlacesCollapsed();
  }, [mapSheet]);
  const selectTag = useCallback((nextTag: string | null) => {
    setTag(current => (current === nextTag ? null : nextTag));
    setSelectedPlaceId(null);
  }, []);
  const submitSearch = useCallback((nextKeyword: string) => {
    const trimmedKeyword = nextKeyword.trim();

    if (!trimmedKeyword) {
      setSearchInput(keyword);
      setMode('map');
      return;
    }

    setSearchInput(trimmedKeyword);
    setKeyword(trimmedKeyword);
    setCategory(null);
    setTag(null);
    setSelectedPlaceId(null);
    setMode('map');
    mapSheet.showPlacesCollapsed();
  }, [keyword, mapSheet]);
  const searchCurrentArea = useCallback(() => {
    setCommittedBounds(draftBounds);
    setSelectedPlaceId(null);
  }, [draftBounds]);
  const resetConditions = useCallback(() => {
    setSearchInput('');
    setKeyword('');
    setCategory(null);
    setTag(null);
    setSelectedPlaceId(null);
  }, []);
  const retry = useCallback(() => {
    if (catalog.hasError) catalog.retry();
    else exploration.retry();
  }, [catalog, exploration]);
  const status = catalog.hasError
    ? 'error'
    : catalog.loading || !catalog.isLoaded
      ? 'initial-loading'
      : exploration.status;
  const openSearch = useCallback(() => setMode('search'), []);
  const closeSearch = useCallback(() => {
    setSearchInput(keyword);
    setMode('map');
  }, [keyword]);
  const clearKeyword = useCallback(() => {
    setSearchInput('');
    setKeyword('');
    setSelectedPlaceId(null);
    mapSheet.showPlacesCollapsed();
  }, [mapSheet]);
  const previewPlace = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
    mapSheet.showMap();
    setMode('map');
  }, [mapSheet]);
  const closeSelectedPlace = useCallback(() => setSelectedPlaceId(null), []);
  const selectPlace = useCallback((place: Place) => {
    router.push({ params: { id: String(place.id) }, pathname: '/places/[id]' });
  }, [router]);
  const updateMapZoom = useCallback((zoomDelta: number) => {
    setMapCamera(current => ({
      ...current,
      zoom: Math.min(
        MAP_MAX_ZOOM,
        Math.max(MAP_MIN_ZOOM, current.zoom + zoomDelta),
      ),
    }));
  }, []);
  const zoomIn = useCallback(() => updateMapZoom(MAP_ZOOM_STEP), [updateMapZoom]);
  const zoomOut = useCallback(() => updateMapZoom(-MAP_ZOOM_STEP), [updateMapZoom]);
  useFocusEffect(
    useCallback(() => {
      if (mode !== 'search' && !selectedPlace) return;

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (mode === 'search') closeSearch();
          else closeSelectedPlace();
          return true;
        },
      );

      return () => subscription.remove();
    }, [closeSearch, closeSelectedPlace, mode, selectedPlace]),
  );

  return {
    activeCategoryCode: category,
    categories: catalog.categories,
    category,
    clearKeyword,
    closeSearch,
    closeSelectedPlace,
    committedBounds,
    draftBounds,
    filteredPlaces: exploration.results,
    floatingActionBottom: mapSheet.floatingActionBottom,
    hasDraftBounds,
    headerHeight,
    insets,
    keyword,
    mapCamera,
    mapPlaces: exploration.results,
    mapSheetHeight: mapSheet.height,
    mapSheetPanHandlers: mapSheet.panHandlers,
    mode,
    openSearch,
    places: exploration.results,
    previewPlace,
    query: searchInput,
    resetConditions,
    resultCount: exploration.resultCount,
    results: exploration.results,
    retry,
    searchCurrentArea,
    selectCategory,
    selectedPlace,
    selectedPlaceId: selectedPlace?.id ?? null,
    selectPlace,
    selectTag,
    setDraftBounds,
    setMapCamera,
    setQuery: setSearchInput,
    showMapView: mapSheet.showMap,
    status,
    submitSearch,
    tag,
    tags: catalog.tags,
    updateMapBounds: setDraftBounds,
    zoomControlBottom: mapSheet.zoomControlBottom,
    zoomIn,
    zoomOut,
  };
}
