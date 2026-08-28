import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NaverMapViewRef } from "@mj-studio/react-native-naver-map";

import type { Place } from "@/features/places/types";

import {
  JEJU_MAP_CAMERA,
  MAP_SEARCH_FIT_PIVOT,
  MAP_SEARCH_SINGLE_RESULT_ZOOM,
} from "../constants";
import { styles as homeStyles } from "../styles";
import type { MapBounds, MapCamera } from "../types";
import { getPlaceCoordinateBounds, toMapBounds } from "../utils/map-utils";
import { loadNativeMapModule } from "../utils/native-modules";
import { hasPlaceCoordinate } from "../utils/place-utils";
import { PlaceMarker } from "./place-marker";

const nativeMapModule = loadNativeMapModule();

interface MapCanvasProps {
  mapCamera: MapCamera;
  onSelectPlace: (place: Place) => void;
  places: Place[];
  fitToPlaces: boolean;
  fitRequestKey?: string;
  mapBottomInset: number;
  selectedPlaceId?: number;
  setMapBounds: (bounds: MapBounds) => void;
  setMapCamera: (camera: MapCamera) => void;
}

export function MapCanvas({
  mapCamera,
  onSelectPlace,
  places,
  fitToPlaces,
  fitRequestKey,
  mapBottomInset,
  selectedPlaceId,
  setMapBounds,
  setMapCamera,
}: MapCanvasProps) {
  const mapRef = useRef<NaverMapViewRef | null>(null);
  const [mapHeight, setMapHeight] = useState(0);
  const visiblePins = places.filter(hasPlaceCoordinate).slice(0, 50);
  const fitKey = useMemo(
    () => `${fitRequestKey ?? ''}|${places
      .filter(hasPlaceCoordinate)
      .map(place => `${place.id}:${place.latitude}:${place.longitude}`)
      .join('|')}`,
    [fitRequestKey, places],
  );
  const lastFitKey = useRef<string | null>(null);
  const fitPivot = useMemo(() => {
    if (mapHeight <= 0) return MAP_SEARCH_FIT_PIVOT;

    const visibleHeight = Math.max(mapHeight - mapBottomInset, 1);
    return {
      x: MAP_SEARCH_FIT_PIVOT.x,
      y: Math.min(0.45, Math.max(0.2, visibleHeight / mapHeight / 2)),
    };
  }, [mapBottomInset, mapHeight]);
  const fitPlacesToMap = useCallback(() => {
    if (!fitToPlaces) {
      lastFitKey.current = null;
      return;
    }

    if (!fitKey || mapHeight <= 0 || !mapRef.current || fitKey === lastFitKey.current) {
      return;
    }

    const bounds = getPlaceCoordinateBounds(visiblePins);
    if (!bounds) return;

    lastFitKey.current = fitKey;
    if (visiblePins.length === 1 ||
      (bounds.neLat - bounds.swLat <= 0.01 && bounds.neLng - bounds.swLng <= 0.01)) {
      const [place] = visiblePins;
      mapRef.current.animateCameraTo({
        latitude: place.latitude,
        longitude: place.longitude,
        pivot: fitPivot,
        zoom: MAP_SEARCH_SINGLE_RESULT_ZOOM,
      });
      return;
    }

    mapRef.current.animateCameraWithTwoCoords({
      coord1: { latitude: bounds.swLat, longitude: bounds.swLng },
      coord2: { latitude: bounds.neLat, longitude: bounds.neLng },
      pivot: fitPivot,
    });
  }, [fitKey, fitPivot, fitToPlaces, mapHeight, visiblePins]);

  useEffect(() => {
    fitPlacesToMap();
  }, [fitPlacesToMap]);

  if (nativeMapModule) {
    const { NaverMapMarkerOverlay, NaverMapView } = nativeMapModule;

    return (
      <View
        onLayout={event => setMapHeight(event.nativeEvent.layout.height)}
        style={homeStyles.mapLayer}
      >
        <NaverMapView
          animationDuration={220}
          camera={mapCamera}
          initialCamera={JEJU_MAP_CAMERA}
          isRotateGesturesEnabled={false}
          isShowCompass={false}
          isShowScaleBar={false}
          isShowZoomControls={false}
          locale="ko"
          logoAlign="BottomLeft"
          logoMargin={{ bottom: 12, left: 12 }}
          mapType="Basic"
          onInitialized={fitPlacesToMap}
          onCameraIdle={(nextCamera) => {
            setMapCamera({
              latitude: nextCamera.latitude,
              longitude: nextCamera.longitude,
              zoom: nextCamera.zoom ?? mapCamera.zoom,
            });
            setMapBounds(toMapBounds(nextCamera.region));
          }}
          style={styles.map}
          ref={mapRef}
        >
          {visiblePins.map(place => (
            <PlaceMarker
              key={place.id}
              MarkerOverlay={NaverMapMarkerOverlay}
              onSelect={onSelectPlace}
              place={place}
              selectedPlaceId={selectedPlaceId}
            />
          ))}
        </NaverMapView>
      </View>
    );
  }

  return (
    <View style={[homeStyles.mapLayer, styles.unavailableMap]}>
      <SymbolView
        name={{ android: "map", ios: "map.fill", web: "map" }}
        size={32}
        tintColor="#8B95A1"
      />
      <Text style={styles.unavailableText}>
        지도를 불러오지 못했어요. 아래 목록에서 장소를 확인해주세요.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  unavailableMap: {
    alignItems: "center",
    backgroundColor: "#F2F4F6",
    justifyContent: "center",
    padding: 24,
  },
  unavailableText: {
    color: "#6B7684",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
