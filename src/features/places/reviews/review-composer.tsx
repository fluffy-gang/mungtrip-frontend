import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

import { PlaceTextArea } from '../detail/text-area';
import { MOCK_REVIEW_PHOTO, PlaceIcon, PlacePhoto } from '../detail/media';
import { placeStyles as s } from '../detail/styles';
import { displayImageUri, errorMessage } from '../detail/validation';
import { saveReviewWithPhotos } from './upload';

import type { DogChoice, PlaceProvider, PlaceReview, SelectedPhoto } from '../detail/types';

interface Props {
  provider: PlaceProvider; placeId: number; defaultDogId?: number;
  onDone(reviewId?: number): void; onBusy(busy: boolean): void;
}
export function ReviewComposer({ provider, placeId, defaultDogId, onDone, onBusy }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [existing, setExisting] = useState<PlaceReview>();
  const [dogs, setDogs] = useState<DogChoice[]>([]);
  const [dogError, setDogError] = useState<string>();
  const [dogId, setDogId] = useState(defaultDogId);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const active = useRef(true);
  const locked = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    void provider.myReview(placeId).then(review => {
      if (cancelled) return;
      setExisting(review ?? undefined); setRating(review?.rating ?? 0); setContent(review?.content ?? '');
      setLoadError(undefined); setLoading(false);
    }).catch(cause => { if (!cancelled) { setLoadError(errorMessage(cause)); setLoading(false); } });
    void provider.dogs().then(result => { if (!cancelled) setDogs(result); })
      .catch(cause => { if (!cancelled) setDogError(errorMessage(cause)); });
    return () => { cancelled = true; };
  }, [provider, placeId, attempt]);
  const lock = (value: boolean) => { locked.current = value; setBusy(value); onBusy(value); };
  const pick = async () => {
    if (locked.current) return;
    lock(true); setError(undefined);
    try {
      if (provider.source === 'mock') {
        setPhotos([{ uri: Image.resolveAssetSource(MOCK_REVIEW_PHOTO).uri, mimeType: 'image/webp' }]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5 });
      if (!active.current || result.canceled) return;
      const selected = result.assets.map(asset => ({ uri: asset.uri, mimeType: asset.mimeType ?? '' }));
      if (selected.some(photo => !['image/jpeg', 'image/png', 'image/webp'].includes(photo.mimeType))) {
        throw new Error('JPG, PNG, WebP 사진만 첨부할 수 있어요.');
      }
      setPhotos(selected.slice(0, 5));
    } catch (cause) { if (active.current) setError(errorMessage(cause)); }
    finally { if (active.current) lock(false); }
  };
  const save = async () => {
    if (locked.current) return;
    lock(true); setError(undefined);
    try {
      const result = await saveReviewWithPhotos(provider, placeId,
        { rating, content, dogId: existing ? undefined : dogs.some(dog => dog.id === dogId) ? dogId : undefined }, photos, existing);
      if (active.current) { lock(false); onDone(result.reviewId); }
    } catch (cause) { if (active.current) { setError(errorMessage(cause)); lock(false); } }
  };
  if (loading) return <ActivityIndicator accessibilityLabel="내 후기 확인 중" />;
  if (loadError) return <><Text style={s.error}>{loadError}</Text><Button onPress={() => { setLoading(true); setAttempt(value => value + 1); }}>다시 시도</Button></>;
  return <>
    <Text style={s.heading}>{existing ? '후기를 수정해주세요' : '방문 후기를 알려주세요'}</Text>
    <View style={[s.row, { justifyContent: 'center', gap: 8 }]}>
      {[1, 2, 3, 4, 5].map(value => <Pressable key={value} style={[s.tap, { opacity: rating >= value ? 1 : 0.22 }]}
        disabled={busy} accessibilityRole="button" accessibilityLabel={`${value}점`} accessibilityState={{ selected: rating === value }} onPress={() => setRating(value)}>
        <PlaceIcon name="star" size={32} />
      </Pressable>)}
    </View>
    {!existing && <>
      {dogs.length > 0 && <View style={{ gap: 8 }}><Text style={s.body}>동행 반려견 (선택)</Text><View style={s.wrap}>
        {dogs.map(dog => <Pressable key={dog.id} disabled={busy} onPress={() => setDogId(dogId === dog.id ? undefined : dog.id)}
          style={[s.chip, dogId === dog.id && s.selectedChip]} accessibilityRole="checkbox" accessibilityState={{ checked: dogId === dog.id }}>
          <Text style={[s.body, dogId === dog.id && s.selectedText]}>{dog.name}</Text>
        </Pressable>)}
      </View></View>}
      {dogError && <Text style={s.small}>반려견 목록을 불러오지 못했어요. 반려견 연결 없이 작성할 수 있어요.</Text>}
      <Button type="sub" disabled={busy} onPress={() => void pick()}>사진 첨부하기</Button>
      <View style={s.wrap}>{photos.map((photo, index) => <View key={photo.uri}>
        <PlacePhoto source={{ uri: photo.uri }} style={{ width: 72, height: 72, borderRadius: 8 }} />
        <Pressable disabled={busy} accessibilityLabel={`사진 ${index + 1} 삭제`} onPress={() => setPhotos(items => items.filter(item => item.uri !== photo.uri))} style={s.tap}><Text style={s.link}>삭제</Text></Pressable>
      </View>)}</View>
    </>}
    {existing && existing.imageUrls.length > 0 && <><Text style={s.small}>등록된 사진과 반려견 정보는 그대로 유지돼요.</Text><View style={s.wrap}>
      {existing.imageUrls.map((ref, index) => <PlacePhoto key={`${ref}:${index}`} source={provider.source === 'mock' && ref.startsWith('review-image/mock-') ? MOCK_REVIEW_PHOTO : displayImageUri(ref) ? { uri: ref } : undefined} style={{ width: 72, height: 72, borderRadius: 8 }} />)}
    </View></>}
    <PlaceTextArea value={content} onChange={setContent} disabled={busy} maxLength={1000}
      placeholder="매장에 대한 후기를 솔직하게 남겨주세요(선택)" />
    <Text style={s.small}>{content.length}/1,000</Text>
    {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Button disabled={busy || !rating} onPress={() => void save()}>{busy ? '저장 중…' : '작성 완료'}</Button>
  </>;
}
