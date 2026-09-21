import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { LikeButton } from '@/components/ui/like-button';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { tokens } from '@/constants/tokens';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../api';
import { SavedThumbnail } from '../components/saved-thumbnail';
import { createSavedController } from '../controller';
import { orderCategories, userVerifiedLabel } from '../logic';
import { savedProvider } from '../provider';
import * as S from './styles';

import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';
import type { SavedCallbacks, SavedProvider } from '../types';

const colors = tokens.colors.semantic.light;
const listStyle = { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, gap: 12, flexGrow: 1 };
const imageStyle = { width: 88, height: 88, borderRadius: 12, backgroundColor: colors.surfaceMuted };
const proofIconStyle = { width: 16, height: 16 };
const starIconStyle = { width: 8, height: 8 };
const officialIcon = require('../assets/official.svg');
const userIcon = require('../assets/user.svg');
const starIcon = require('../assets/star.svg');
interface Props extends SavedCallbacks { provider?: SavedProvider; }

export function SavedScreen({ provider = savedProvider, ...callbacks }: Props) {
  const controller = useMemo(() => createSavedController(provider), [provider]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const snapshot = useSyncExternalStore(provider.subscribe, provider.getSnapshot, provider.getSnapshot);
  const current = snapshot[state.tab];
  const disabled = state.busy !== null;
  const places = controller.visiblePlaces();
  const categories = orderCategories(CATEGORY_ORDER, snapshot.places.items).map(code => [code, CATEGORY_LABELS[code]] as const);
  const selected = new Set(state.selectedIds);
  const allVisible = places.length > 0 && places.every(item => selected.has(item.id));

  useFocusEffect(useCallback(() => {
    if (provider.getSnapshot().sessionRevision === snapshot.sessionRevision) void provider.refresh();
  }, [provider, snapshot.sessionRevision]));
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!state.selectionMode) return false;
      controller.cancelSelection();
      return true;
    });
    return () => subscription.remove();
  }, [controller, state.selectionMode]);

  const refresh = () => { void provider.refresh(state.tab); };
  const findPlaces = callbacks.onFindPlaces ?? controller.unavailable;
  return (
    <S.Root>
      <S.Header>
        {state.selectionMode ? (
          <Pressable accessibilityRole="button" disabled={disabled} onPress={controller.cancelSelection} hitSlop={12}>
            <Text fontSize={14} color="textSecondary">취소</Text>
          </Pressable>
        ) : (
          <S.Tabs>
            {(['places', 'courses'] as const).map(tab => (
              <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: state.tab === tab, disabled }} disabled={disabled} onPress={() => controller.setTab(tab)}>
                <S.TabTitle fontWeight="bold" $active={state.tab === tab}>{tab === 'places' ? '장소' : '코스'}</S.TabTitle>
              </Pressable>
            ))}
          </S.Tabs>
        )}
        {state.selectionMode && <Text fontSize={18} fontWeight="bold">{selected.size}개 선택됨</Text>}
        {state.tab === 'places' && (
          <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected: state.selectionMode && allVisible }} disabled={disabled} onPress={state.selectionMode ? controller.selectVisible : controller.enterSelection} hitSlop={12}>
            <Text fontSize={14} color="textSecondary">{state.selectionMode ? allVisible ? '전체 해제' : '전체 선택' : '선택'}</Text>
          </Pressable>
        )}
      </S.Header>
      {state.tab === 'places' && (
        <S.Rail>
          {[['all', '전체'], ...categories].map(([code, label]) => (
            <S.Chip key={code} $active={state.category === code} accessibilityRole="button" accessibilityState={{ selected: state.category === code, disabled }} disabled={disabled} onPress={() => controller.setCategory(code)}>
              <Text fontSize={14} color={state.category === code ? 'onInverse' : 'textSecondary'}>{label}</Text>
            </S.Chip>
          ))}
        </S.Rail>
      )}
      <S.Summary>
        <Text fontSize={14} color="textPlaceholder">{state.tab === 'places' ? places.length : snapshot.courses.totalCount}개</Text>
        {state.tab === 'places' && (
          <Pressable accessibilityRole="button" disabled={disabled} onPress={() => controller.showMap(callbacks.onShowMap)} hitSlop={12}>
            <Text fontSize={14} color="primary">지도로 보기</Text>
          </Pressable>
        )}
      </S.Summary>
      {state.feedback && (
        <S.Feedback accessibilityRole="button" accessibilityLabel={`${state.feedback} 알림 닫기`} accessibilityLiveRegion="polite" onPress={controller.clearFeedback}>
          <Text fontSize={14} lineHeight={20}>{state.feedback}</Text>
        </S.Feedback>
      )}
      {current.status === 'error' ? (
        <S.Center>
          <Text fontSize={14} lineHeight={22} style={{ textAlign: 'center' }}>{current.error}</Text>
          <Button fullWidth={false} size="m" onPress={refresh}>다시 시도</Button>
        </S.Center>
      ) : !current.loaded || current.status === 'loading' ? (
        <S.Center><ActivityIndicator accessibilityLabel="저장 목록 불러오는 중" color={colors.primary} /></S.Center>
      ) : state.tab === 'places' ? (
        <FlatList
          data={places}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={listStyle}
          refreshControl={<RefreshControl refreshing={current.status === 'refreshing'} onRefresh={refresh} />}
          ListEmptyComponent={<EmptyState tab="places" filtered={snapshot.places.items.length > 0} onFind={findPlaces} />}
          renderItem={({ item }) => (
            <PlaceRow
              place={item} selecting={state.selectionMode} selected={selected.has(item.id)}
              disabled={disabled || snapshot.busyPlaceIds.includes(item.id)}
              onPress={() => state.selectionMode ? controller.toggleSelected(item.id) : callbacks.onOpenPlace ? callbacks.onOpenPlace({ placeId: item.id, source: provider.source }) : controller.unavailable()}
              onLike={() => { void controller.toggleLike(item.id, 'places'); }}
            />
          )}
        />
      ) : (
        <FlatList
          data={snapshot.courses.items}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={listStyle}
          refreshControl={<RefreshControl refreshing={current.status === 'refreshing'} onRefresh={refresh} />}
          ListEmptyComponent={<EmptyState tab="courses" onFind={findPlaces} />}
          renderItem={({ item }) => (
            <CourseRow
              course={item} disabled={disabled || snapshot.busyCourseIds.includes(item.id)}
              onPress={() => callbacks.onOpenCourse ? callbacks.onOpenCourse({ courseId: item.id, source: provider.source }) : controller.unavailable()}
              onLike={() => { void controller.toggleLike(item.id, 'courses'); }}
              onTrip={() => { void controller.addCourse(item, callbacks.onAddCourseToTrip); }}
            />
          )}
        />
      )}
      {state.selectionMode && (
        <S.Bottom>
          <S.ButtonSlot><Button type="sub" size="m" disabled={!selected.size || disabled} onPress={() => { void controller.unlikeSelected(); }}>찜 해제</Button></S.ButtonSlot>
          <S.ButtonSlot><Button size="m" disabled={!selected.size || disabled} onPress={() => { void controller.createTrip(callbacks.onCreateOrAddTrip); }}>{selected.size}곳 일정 생성</Button></S.ButtonSlot>
        </S.Bottom>
      )}
    </S.Root>
  );
}

function PlaceRow({ place, selecting, selected, disabled, onPress, onLike }: {
  place: Place; selecting: boolean; selected: boolean; disabled: boolean; onPress: () => void; onLike: () => void;
}) {
  const userVerified = userVerifiedLabel(place);
  return (
    <S.Row $selecting={selecting} $selected={selected}>
      <S.RowMain accessibilityRole={selecting ? 'checkbox' : 'button'} accessibilityLabel={place.name} accessibilityState={{ checked: selecting ? selected : undefined, disabled }} disabled={disabled} onPress={onPress}>
        {selecting && <S.Check $selected={selected}>{selected && <Icon name="check" size={16} tintColor={colors.onPrimary} />}</S.Check>}
        {/* TODO(#26): Figma(481:1489)는 썸네일 좌하단에 동행 가능 반려견 아바타를 그리지만 저장 목록 응답에 반려견 데이터가 없다. */}
        <SavedThumbnail imageUrl={place.imageUrl} style={imageStyle} />
        <S.PlaceInfo>
          <Text numberOfLines={1} fontSize={14} fontWeight="bold" lineHeight={20} color="textSecondary">{place.name}</Text>
          <S.Tags>{[...new Set(place.tags)].slice(0, 2).map(tag => <S.Tag key={tag}><Text fontSize={11} fontWeight="semibold" color="textTertiary" lineHeight={16.5}>{tag}</Text></S.Tag>)}</S.Tags>
          {(place.isOfficial || userVerified) && (
            <S.Proof>
              {place.isOfficial && <S.ProofItem><Image source={officialIcon} style={proofIconStyle} /><Text fontSize={11} fontWeight="semibold" color="accentBlue" lineHeight={16.5}>공식인증</Text></S.ProofItem>}
              {userVerified && (
                <S.ProofItem>
                  <Image source={userIcon} style={proofIconStyle} />
                  <Text fontSize={11} fontWeight="semibold" color="textPlaceholder" lineHeight={16.5}>
                    {userVerified.count}
                    {userVerified.relative && <Text fontSize={11} fontWeight="regular" color="textDisabled" lineHeight={16.5}>{` ${userVerified.relative}`}</Text>}
                  </Text>
                </S.ProofItem>
              )}
            </S.Proof>
          )}
          {place.rating !== undefined && (
            <S.Rating>
              <Image source={starIcon} style={starIconStyle} />
              <Text fontSize={10} fontWeight="medium" color="textTertiary" lineHeight={12}>{place.rating.toFixed(1)}</Text>
            </S.Rating>
          )}
        </S.PlaceInfo>
      </S.RowMain>
      {!selecting && <LikeButton liked size={28} accessibilityLabel={`${place.name} 찜 해제`} busy={disabled} onPress={onLike} />}
    </S.Row>
  );
}
function CourseRow({ course, disabled, onPress, onLike, onTrip }: { course: Course; disabled: boolean; onPress: () => void; onLike: () => void; onTrip: () => void }) {
  return (
    <S.CourseCard>
      <S.CourseMain accessibilityRole="button" accessibilityLabel={course.title} disabled={disabled} onPress={onPress}>
        <SavedThumbnail imageUrl={course.thumbnailUrl} style={{ width: '100%', height: '100%' }} />
        <S.Scrim />
        <S.Badge><Text fontSize={11} color="onInverse" lineHeight={14}>{course.placeCount}곳 · {course.totalDistanceKm}km</Text></S.Badge>
        <S.CourseInfo><Text fontSize={12} color="onInverse" numberOfLines={1}>{course.region}</Text><Text fontSize={16} fontWeight="bold" color="onInverse" lineHeight={22} numberOfLines={1}>{course.title}</Text></S.CourseInfo>
      </S.CourseMain>
      <LikeButton liked size={28} variant="muted" accessibilityLabel={`${course.title} 찜 해제`} busy={disabled} onPress={onLike} style={{ position: 'absolute', top: 8, right: 8 }} />
      <S.TripButton accessibilityRole="button" accessibilityLabel={`${course.title} 내 여행에 추가`} accessibilityState={{ disabled }} disabled={disabled} onPress={onTrip}><SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={12} tintColor={colors.textSecondary} /><Text fontSize={11} color="textSecondary">내 여행</Text></S.TripButton>
    </S.CourseCard>
  );
}
function EmptyState({ tab, filtered = false, onFind }: { tab: 'places' | 'courses'; filtered?: boolean; onFind: () => void }) {
  const noun = tab === 'places' ? '장소' : '코스';
  return (
    <S.Center>
      <Text fontSize={18} fontWeight="bold" lineHeight={26} style={{ textAlign: 'center' }}>{filtered ? '이 카테고리에는 찜한 장소가 없어요' : `아직 찜한 ${noun}가 없어요`}</Text>
      <Text fontSize={14} color="textTertiary" lineHeight={22} style={{ textAlign: 'center' }}>{filtered ? '다른 카테고리를 선택해 보세요.' : `마음에 드는 ${noun}를 찜하면\n여기서 모아볼 수 있어요`}</Text>
      {!filtered && <S.EmptyButtonSlot><Button size="m" onPress={onFind}>지도에서 {noun} 찾기</Button></S.EmptyButtonSlot>}
    </S.Center>
  );
}
