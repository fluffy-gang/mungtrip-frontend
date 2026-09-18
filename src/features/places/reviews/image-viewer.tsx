import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceIcon, PlacePhoto } from '../detail/media';
import { colors, placeStyles as s } from '../detail/styles';

import type { PhotoSource } from '../detail/media';

export function ImageViewer({ images, initialIndex = 0, onClose }: {
  images: (PhotoSource | undefined)[]; initialIndex?: number; onClose(): void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const start = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
  const [index, setIndex] = useState(start);
  return <Modal visible animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: colors.inverse, paddingTop: insets.top }}>
      <View style={[s.between, { paddingHorizontal: 12, height: 48 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="사진 닫기" style={s.tap} onPress={onClose}>
          <PlaceIcon name="close" />
        </Pressable><Text style={[s.body, { color: colors.onInverse }]}>{images.length ? index + 1 : 0}/{images.length}</Text>
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        contentOffset={{ x: start * width, y: 0 }}
        onMomentumScrollEnd={event => setIndex(Math.min(images.length - 1, Math.round(event.nativeEvent.contentOffset.x / width)))}>
        {images.map((source, photoIndex) => <View key={photoIndex} style={{ width, height: height - insets.top - insets.bottom - 48, justifyContent: 'center' }}>
          <PlacePhoto source={source} contain style={{ width, height: Math.min(width * 4 / 3, height - insets.top - insets.bottom - 80) }} />
        </View>)}
      </ScrollView>
    </View>
  </Modal>;
}
