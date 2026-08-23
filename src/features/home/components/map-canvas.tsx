import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Place, PlaceCategory } from "@/features/places/types";

import { JEJU_MAP_CAMERA } from "../constants";
import { styles as homeStyles } from "../styles";
import type { LocationCoordinate, MapBounds, MapCamera } from "../types";
import { toMapBounds } from "../utils/map-utils";
import { loadNativeMapModule } from "../utils/native-modules";
import { hasPlaceCoordinate } from "../utils/place-utils";
import { PlaceMarker } from "./place-marker";

const nativeMapModule = loadNativeMapModule();

interface MapCanvasProps {
  mapCamera: MapCamera;
  onSelectPlace: (place: Place) => void;
  places: Place[];
  selectedCategory?: PlaceCategory;
  selectedPlaceId?: number;
  setMapBounds: (bounds: MapBounds) => void;
  setMapCamera: (camera: MapCamera) => void;
  userCoordinate: LocationCoordinate | null;
  userProfileImageUrl?: string;
}

export function MapCanvas({
  mapCamera,
  onSelectPlace,
  places,
  selectedCategory,
  selectedPlaceId,
  setMapBounds,
  setMapCamera,
  userCoordinate,
  userProfileImageUrl,
}: MapCanvasProps) {
  const visiblePins = places.filter(hasPlaceCoordinate).slice(0, 50);
  const userMarkerSource = useMemo(
    () => ({ uri: userProfileImageUrl }),
    [userProfileImageUrl],
  );

  if (nativeMapModule) {
    const { NaverMapMarkerOverlay, NaverMapView } = nativeMapModule;

    return (
      <View style={homeStyles.mapLayer}>
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
          onCameraIdle={(nextCamera) => {
            setMapCamera({
              latitude: nextCamera.latitude,
              longitude: nextCamera.longitude,
              zoom: nextCamera.zoom ?? mapCamera.zoom,
            });
            setMapBounds(toMapBounds(nextCamera.region));
          }}
          style={styles.map}
        >
          {visiblePins.map((place) => {
            const isSelected = place.id === selectedPlaceId;
            const isCategoryMatch =
              !selectedCategory || place.category === selectedCategory.code;

            return (
              <PlaceMarker
                key={`${place.id}-${isSelected ? "selected" : "default"}-${isCategoryMatch ? "match" : "dim"}`}
                MarkerOverlay={NaverMapMarkerOverlay}
                onSelect={onSelectPlace}
                place={place}
                selectedCategory={selectedCategory}
                selectedPlaceId={selectedPlaceId}
              />
            );
          })}
          {userCoordinate && userProfileImageUrl ? (
            <NaverMapMarkerOverlay
              anchor={{ x: 0.5, y: 0.5 }}
              height={38}
              isForceShowIcon
              latitude={userCoordinate.latitude}
              longitude={userCoordinate.longitude}
              width={38}
              zIndex={100}
            >
              <Image
                collapsable={false}
                contentFit="cover"
                source={userMarkerSource}
                style={homeStyles.nativeUserLocationMarker}
              />
            </NaverMapMarkerOverlay>
          ) : null}
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
        지도는 Android/iOS 개발 빌드에서 확인할 수 있어요.
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
