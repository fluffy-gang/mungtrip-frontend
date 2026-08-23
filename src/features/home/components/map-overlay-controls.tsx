import { Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { styles } from '../styles';

interface MapOverlayControlsProps {
  myLocationButtonBottom: number;
  onMoveToCurrentLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  visible: boolean;
  zoomControlBottom: number;
}

export function MapOverlayControls({
  myLocationButtonBottom,
  onMoveToCurrentLocation,
  onZoomIn,
  onZoomOut,
  visible,
  zoomControlBottom,
}: MapOverlayControlsProps) {
  if (!visible) {
    return null;
  }

  return (
    <>
      <View style={[styles.zoomControl, { bottom: zoomControlBottom }]}>
        <Pressable
          accessibilityLabel="지도 확대"
          accessibilityRole="button"
          onPress={onZoomIn}
          style={styles.zoomButton}
        >
          <SymbolView name={{ android: 'zoom_in', ios: 'plus.magnifyingglass', web: 'zoom_in' }} size={20} tintColor="#4E5968" />
        </Pressable>
        <View style={styles.zoomDivider} />
        <Pressable
          accessibilityLabel="지도 축소"
          accessibilityRole="button"
          onPress={onZoomOut}
          style={styles.zoomButton}
        >
          <SymbolView name={{ android: 'zoom_out', ios: 'minus.magnifyingglass', web: 'zoom_out' }} size={20} tintColor="#4E5968" />
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel="내 위치로 이동"
        accessibilityRole="button"
        onPress={onMoveToCurrentLocation}
        style={[styles.myLocationButton, { bottom: myLocationButtonBottom }]}
      >
        <SymbolView name={{ android: 'my_location', ios: 'location.fill', web: 'my_location' }} size={20} tintColor="#4E5968" />
      </Pressable>
    </>
  );
}
