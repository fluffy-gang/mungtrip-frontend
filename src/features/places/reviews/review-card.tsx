import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MOCK_REVIEW_PHOTO, PlaceIcon, PlacePhoto } from '../detail/media';
import { colors, placeStyles as s } from '../detail/styles';
import { displayImageUri, REJECTION_LABELS } from '../detail/validation';
import { ImageViewer } from './image-viewer';

import type { PhotoSource } from '../detail/media';
import type { PlaceSource, ReviewItem } from '../detail/types';

export function ReviewCard({ item, source, compact = false }: { item: ReviewItem; source: PlaceSource; compact?: boolean }) {
  const [viewer, setViewer] = useState<number>();
  const images: (PhotoSource | undefined)[] = item.imageUrls.map(ref =>
    source === 'mock' && (ref === 'mock-photo:review' || ref.startsWith('review-image/mock-')) ? MOCK_REVIEW_PHOTO : displayImageUri(ref) ? { uri: ref } : undefined);
  return <View style={{ gap: 12, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceSubtle }}>
    <View style={s.row}><PlaceIcon name="users" size={32} /><View style={s.grow}>
      <Text style={s.label}>{item.userNickname ?? '여행자'}</Text>
      <Text style={s.small}>{item.type === 'REJECTED' ? '방문 거절됨 · ' : ''}{item.reviewerVisitCount === undefined ? '방문 후기' : `방문 인증 ${item.reviewerVisitCount}개`}</Text>
    </View></View>
    <View style={s.row}>{item.rating !== undefined && <View style={[s.row, { gap: 2 }]}>
      {Array.from({ length: item.rating }, (_, i) => <PlaceIcon key={i} name="star" size={10} />)}
    </View>}<Text style={s.small}>{item.occurredAt?.replaceAll('-', '.') ?? ''}</Text></View>
    {item.type === 'REJECTED' && item.rejectReason && <View style={[s.hint, { alignSelf: 'flex-start', padding: 6 }]}><Text style={s.small}>{REJECTION_LABELS[item.rejectReason]}</Text></View>}
    <Text style={s.body} numberOfLines={compact ? 4 : undefined}>{item.type === 'REJECTED' ? item.rejectDetail || '방문이 어려웠어요.' : item.content || '별점으로 후기를 남겼어요.'}</Text>
    {images.length > 0 && <View style={s.wrap}>{images.map((image, i) => <Pressable key={i}
      accessibilityRole="button" accessibilityLabel={`후기 사진 ${i + 1} 크게 보기`} onPress={() => setViewer(i)}>
      <PlacePhoto source={image} style={{ width: compact ? 100 : 104, height: 80, borderRadius: 8 }} />
    </Pressable>)}</View>}
    {item.dog && <View style={[s.chip, { alignSelf: 'flex-start' }]}><Text style={s.small}>
      {[item.dog.breed ?? item.dog.size, item.dog.weight === undefined ? undefined : `${item.dog.weight}kg`].filter(Boolean).join(' · ')}
    </Text></View>}
    {viewer !== undefined && <ImageViewer images={images} initialIndex={viewer} onClose={() => setViewer(undefined)} />}
  </View>;
}
