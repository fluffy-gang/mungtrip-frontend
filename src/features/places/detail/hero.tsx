import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { LikeButton } from '@/components/ui/like-button';

import { PlaceIcon, PlacePhoto } from './media';
import { colors, placeStyles as s } from './styles';

import type { PhotoSource } from './media';

export function DetailHero({ images, onImage }: { images: PhotoSource[]; onImage(index: number): void }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  return <View style={{ height: 311, backgroundColor: colors.surfaceSubtle }}>
    {images.length ? <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={event => setPage(Math.round(event.nativeEvent.contentOffset.x / width))}>
      {images.map((source, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`장소 사진 ${index + 1} 크게 보기`} onPress={() => onImage(index)}>
        <PlacePhoto source={source} style={{ width, height: 311 }} />
      </Pressable>)}
    </ScrollView> : <PlacePhoto style={{ width, height: 311 }} />}
    {images.length > 0 && <View style={{ position: 'absolute', bottom: 16, right: 8, backgroundColor: colors.overlayScrim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={[s.small, { color: colors.onInverse }]}>{page + 1}/{images.length}</Text>
    </View>}
  </View>;
}
export function DetailHeader({ title, top, solid, liked, disabled, onBack, onShare, onLike }: {
  title: string; top: number; solid: boolean; liked: boolean; disabled: boolean;
  onBack(): void; onShare(): void; onLike(): void;
}) {
  const actionStyle = { ...s.tap, borderRadius: 30, backgroundColor: solid ? colors.background : '#FFFFFFBF' };
  return <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: top, backgroundColor: solid ? colors.background : 'transparent' }}>
    <View style={[s.between, { height: 48, paddingHorizontal: 8 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" onPress={onBack} style={actionStyle}><PlaceIcon name="back" /></Pressable>
      {solid && <Text style={[s.label, s.grow]} numberOfLines={1}>{title}</Text>}
      <View style={s.row}><Pressable accessibilityRole="button" accessibilityLabel="장소 공유" style={actionStyle} onPress={onShare}><PlaceIcon name="share" /></Pressable>
        <LikeButton liked={liked} size={28} variant="outline" disabled={disabled} busy={disabled}
          style={actionStyle} onPress={onLike} /></View>
    </View>
  </View>;
}
