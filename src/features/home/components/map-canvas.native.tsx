import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";


import { JEJU_MAP_CAMERA } from "../constants";
import { styles as homeStyles } from "../styles";
import { toMapBounds } from "../utils/map-utils";
import { loadNativeMapModule } from "../utils/native-modules";
import { hasPlaceCoordinate } from "../utils/place-utils";
import { PlaceMarker } from "./place-marker";

import type { MapCanvasProps } from './map-canvas.types';
const nativeMapModule = loadNativeMapModule();

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
                // Android tracks updates; replacing a selected marker recycles its active bitmap.
                key={Platform.OS === 'ios' ? `${place.id}-${isSelected ? "selected" : "default"}-${isCategoryMatch ? "match" : "dim"}` : place.id}
                MarkerOverlay={NaverMapMarkerOverlay}
                onSelect={onSelectPlace}
                place={place}
                selectedCategory={selectedCategory}
                selectedPlaceId={selectedPlaceId}
              />
            );
          })}
          {userCoordinate ? (
            <NaverMapMarkerOverlay
              anchor={{ x: 0.5, y: 0.5 }}
              height={38}
              isForceShowIcon
              latitude={userCoordinate.latitude}
              longitude={userCoordinate.longitude}
              width={38}
              zIndex={100}
            >
              {userProfileImageUrl ? (
                <Image
                  collapsable={false}
                  contentFit="cover"
                  source={userMarkerSource}
                  style={homeStyles.nativeUserLocationMarker}
                />
              ) : (
                <View collapsable={false} style={styles.userLocationFallback}>
                  <View style={styles.userLocationDot} />
                </View>
              )}
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
  userLocationDot: {
    backgroundColor: "#1C7CFE",
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  userLocationFallback: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#1C7CFE",
    borderRadius: 19,
    borderWidth: 2,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
});
