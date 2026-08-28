import { StyleSheet, View } from 'react-native';

import { tokens } from '@/constants/tokens';
import { loadNativeMapModule } from '@/features/home/utils/native-modules';
import {
  getPlaceMarkerIconMask,
  placeMarkerBackgroundMask,
} from '@/features/places/map-marker-images';
import type { Place } from '@/features/places/types';

const nativeMapModule = loadNativeMapModule();

export function PlaceStaticMap({ place }: { place: Place }) {
  if (
    !nativeMapModule ||
    !Number.isFinite(place.latitude) ||
    !Number.isFinite(place.longitude)
  ) {
    return null;
  }

  const { NaverMapMarkerOverlay, NaverMapView } = nativeMapModule;
  const coordinate = {
    latitude: place.latitude as number,
    longitude: place.longitude as number,
  };

  return (
    <View
      accessibilityLabel={`${place.name} 위치 지도`}
      accessibilityRole="image"
      pointerEvents="none"
      style={styles.frame}
      testID="place-static-map"
    >
      <NaverMapView
        camera={{ ...coordinate, zoom: 15 }}
        initialCamera={{ ...coordinate, zoom: 15 }}
        isRotateGesturesEnabled={false}
        isScrollGesturesEnabled={false}
        isShowCompass={false}
        isShowIndoorLevelPicker={false}
        isShowLocationButton={false}
        isShowScaleBar={false}
        isShowZoomControls={false}
        isStopGesturesEnabled={false}
        isTiltGesturesEnabled={false}
        isZoomGesturesEnabled={false}
        locale="ko"
        logoAlign="BottomLeft"
        logoMargin={{ bottom: 8, left: 8 }}
        mapType="Basic"
        style={styles.map}
      >
        <NaverMapMarkerOverlay
          anchor={{ x: 0.5, y: 0.5 }}
          height={40}
          image={placeMarkerBackgroundMask}
          isForceShowIcon
          latitude={coordinate.latitude}
          longitude={coordinate.longitude}
          tintColor="#FE6A20"
          width={40}
        />
        <NaverMapMarkerOverlay
          anchor={{ x: 0.5, y: 0.5 }}
          height={16}
          image={getPlaceMarkerIconMask(place.category)}
          isForceShowIcon
          latitude={coordinate.latitude}
          longitude={coordinate.longitude}
          tintColor="#FFFFFF"
          width={16}
          zIndex={1}
        />
      </NaverMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: tokens.radius[12],
    height: 180,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
