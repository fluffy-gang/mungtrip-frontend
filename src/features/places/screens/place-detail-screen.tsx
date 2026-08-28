import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APP_INFORMATION,
  getHttpsExternalUrl,
} from '@/constants/app-information';
import { tokens } from '@/constants/tokens';
import {
  openExternalUrl,
  openExternalUrlWithFallback,
} from '@/shared/utils/open-external-url';

import { PlaceImageCarousel } from '../components/place-image-carousel';
import { PlaceStaticMap } from '../components/place-static-map';
import { usePlaceDetail } from '../hooks/use-place-detail';
import { buildExternalMapLinks, type MapProvider } from '../map-links';
import type { Place } from '../types';

const colors = tokens.colors.semantic.light;
const { spacing } = tokens;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text accessibilityRole="header" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

function InformationRow({
  icon,
  text,
}: {
  icon: Parameters<typeof SymbolView>[0]['name'];
  text: string;
}) {
  return (
    <View style={styles.informationRow}>
      <SymbolView name={icon} size={18} tintColor={colors.textTertiary} />
      <Text style={styles.informationText}>{text}</Text>
    </View>
  );
}

function PlaceDetails({
  bottomInset,
  place,
}: {
  bottomInset: number;
  place: Place;
}) {
  const homepageUrl = getHttpsExternalUrl(place.homepageUrl);
  const phoneNumber = place.phoneNumber?.trim();
  const hasOtherInformation = Boolean(
    place.petRestrictions ||
      place.businessHours ||
      place.tags.length ||
      phoneNumber ||
      homepageUrl,
  );
  const openDirections = (provider: MapProvider) => {
    const links = buildExternalMapLinks(provider, place);
    const targetName = provider === 'naver' ? '네이버지도' : '카카오맵';

    void openExternalUrlWithFallback(
      links.appUrl,
      links.fallbackUrl,
      targetName,
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing[32] + bottomInset }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <PlaceImageCarousel
        fallbackImageUrl={place.imageUrl}
        images={place.images}
      />

      <View style={styles.content}>
        <View style={styles.introSection}>
          <Text accessibilityRole="header" style={styles.placeName}>
            {place.name}
          </Text>
          {place.description ? (
            <Text style={styles.description}>{place.description}</Text>
          ) : null}
          <View style={styles.metadataRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{place.categoryName}</Text>
            </View>
            {place.isOfficial ? (
              <View style={styles.officialRow}>
                <SymbolView
                  name={{
                    android: 'verified',
                    ios: 'checkmark.shield.fill',
                    web: 'verified',
                  }}
                  size={16}
                  tintColor={colors.primary}
                />
                <Text style={styles.officialText}>
                  {APP_INFORMATION.dataSourceName} 공식 데이터
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {hasOtherInformation ? (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <SectionTitle>기타 정보</SectionTitle>
              {place.petRestrictions ? (
                <InformationRow
                  icon={{ android: 'pets', ios: 'pawprint', web: 'pets' }}
                  text={place.petRestrictions}
                />
              ) : null}
              {place.businessHours ? (
                <InformationRow
                  icon={{
                    android: 'schedule',
                    ios: 'clock',
                    web: 'schedule',
                  }}
                  text={place.businessHours}
                />
              ) : null}
              {place.tags.length ? (
                <View style={styles.tagRow}>
                  {place.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {phoneNumber || homepageUrl ? (
                <View style={styles.linkActions}>
                  {phoneNumber ? (
                    <Pressable
                      accessibilityLabel={`${phoneNumber}로 전화`}
                      accessibilityRole="button"
                      onPress={() =>
                        void openExternalUrl(`tel:${phoneNumber}`, '전화 앱')
                      }
                      style={styles.textAction}
                    >
                      <SymbolView
                        name={{ android: 'call', ios: 'phone', web: 'call' }}
                        size={17}
                        tintColor={colors.textSecondary}
                      />
                      <Text style={styles.textActionText}>전화</Text>
                    </Pressable>
                  ) : null}
                  {homepageUrl ? (
                    <Pressable
                      accessibilityLabel="홈페이지에서 방문 정보 확인"
                      accessibilityRole="link"
                      onPress={() =>
                        void openExternalUrl(homepageUrl, '홈페이지')
                      }
                      style={styles.textAction}
                    >
                      <SymbolView
                        name={{
                          android: 'language',
                          ios: 'globe',
                          web: 'language',
                        }}
                        size={17}
                        tintColor={colors.textSecondary}
                      />
                      <Text style={styles.textActionText}>홈페이지</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <View style={styles.divider} />
        <View style={styles.section}>
          <SectionTitle>주소 및 장소 정보</SectionTitle>
          <InformationRow
            icon={{ android: 'place', ios: 'mappin', web: 'place' }}
            text={`${place.address}${
              place.detailAddress ? ` ${place.detailAddress}` : ''
            }`}
          />
          <PlaceStaticMap place={place} />
          <View style={styles.directionActions}>
            {(['naver', 'kakao'] as const).map(provider => (
              <Pressable
                accessibilityRole="link"
                key={provider}
                onPress={() => openDirections(provider)}
                style={styles.directionButton}
              >
                <SymbolView
                  name={{
                    android: 'directions',
                    ios: 'arrow.triangle.turn.up.right.diamond',
                    web: 'directions',
                  }}
                  size={17}
                  tintColor={colors.primary}
                />
                <Text style={styles.directionButtonText}>
                  {provider === 'naver' ? '네이버지도' : '카카오맵'} 길찾기
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sourceText}>{APP_INFORMATION.accuracyNotice}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export function PlaceDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const detail = usePlaceDetail(id);

  const isMissing = detail.status === 'invalid' || detail.status === 'not-found';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <SymbolView
            name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }}
            size={24}
            tintColor={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>장소 상세</Text>
        <View style={styles.headerSpacer} />
      </View>
      {detail.status === 'loading' ? (
        <View style={styles.stateBox} testID="place-detail-state">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateTitle}>장소 정보를 불러오는 중이에요</Text>
        </View>
      ) : detail.status === 'success' ? (
        detail.place ? (
          <PlaceDetails bottomInset={insets.bottom} place={detail.place} />
        ) : null
      ) : (
        <View style={styles.stateBox} testID="place-detail-state">
          <SymbolView
            name={{ android: 'pets', ios: 'pawprint.fill', web: 'pets' }}
            size={32}
            tintColor={colors.textPlaceholder}
          />
          <Text style={styles.stateTitle}>
            {isMissing
              ? '장소를 찾을 수 없어요'
              : '장소 정보를 불러오지 못했어요'}
          </Text>
          <Text style={styles.stateText}>
            {isMissing
              ? '이전 화면으로 돌아가 다른 장소를 선택해 주세요.'
              : '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'}
          </Text>
          {detail.status === 'error' ? (
            <Pressable
              accessibilityRole="button"
              onPress={detail.retry}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>다시 시도</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing[16],
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: -spacing[8],
    width: 44,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  stateBox: {
    alignItems: 'center',
    flex: 1,
    gap: spacing[12],
    justifyContent: 'center',
    paddingVertical: spacing[24],
    paddingHorizontal: spacing[16],
  },
  stateTitle: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    textAlign: 'center',
  },
  placeName: {
    color: colors.textPrimary,
    fontFamily: tokens.fonts.sansSerif,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
  },
  content: {
    paddingHorizontal: spacing[16],
  },
  introSection: {
    gap: spacing[12],
    paddingVertical: spacing[24],
  },
  description: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 16,
    lineHeight: 24,
  },
  metadataRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[12],
  },
  categoryChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: tokens.radius.full,
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing[10],
  },
  categoryText: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '600',
  },
  officialRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[4],
  },
  officialText: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: colors.border,
    height: tokens.borderWidth.hairline,
  },
  section: {
    gap: spacing[16],
    paddingVertical: spacing[32],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 18,
    fontWeight: '700',
  },
  informationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[10],
  },
  informationText: {
    color: colors.textSecondary,
    flex: 1,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
  tag: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: tokens.radius.full,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: spacing[10],
  },
  tagText: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '600',
  },
  linkActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
  textAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[6],
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing[8],
  },
  textActionText: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '600',
  },
  directionActions: {
    flexDirection: 'row',
    gap: spacing[8],
  },
  directionButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: tokens.radius[12],
    borderWidth: tokens.borderWidth[1],
    flex: 1,
    flexDirection: 'row',
    gap: spacing[6],
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing[8],
  },
  directionButtonText: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '600',
  },
  sourceText: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing[4],
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing[16],
  },
  actionButtonText: {
    color: colors.primary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 15,
    fontWeight: '700',
  },
});
