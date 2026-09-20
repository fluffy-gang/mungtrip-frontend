import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  BottomActions,
  BottomSheet,
  DogPlaceholder,
  OnboardingPage,
  ScreenTitle,
} from '@/features/onboarding/components';

import { tokens } from '@/constants/tokens';
import { useOnboarding } from '../../context';
import { isRenderableImageUri } from '../../preset-assets';
import { SafeImage } from '../../components/safe-image';
import { appendSubjectParticle } from '@/utils/string';
import { styles } from './style';

import type { Href } from 'expo-router';
import type { DogSummaryCardProps } from './type';

function DogSummaryCard({ dog, onEdit }: DogSummaryCardProps) {
  const sizeLabel = { L: '대형', M: '중형', S: '소형' }[dog.size];

  return (
    <View style={styles.dogCard}>
      {isRenderableImageUri(dog.profileImageUrl) ? (
        <SafeImage fallback={<DogPlaceholder compact style={styles.dogCardImage} />} source={{ uri: dog.profileImageUrl }} style={styles.dogCardImage} />
      ) : (
        <DogPlaceholder compact />
      )}
      <View style={styles.flex}>
        <View style={styles.dogNameRow}>
          <Text fontSize={18} fontWeight="bold" lineHeight={24}>
            {dog.name || '우리 아이'}
          </Text>
          <View style={styles.sizeBadge}>
            <Text color="onInverse" fontSize={11} fontWeight="bold" lineHeight={16}>
              {sizeLabel}
            </Text>
          </View>
        </View>
        <View style={styles.personalitySummary}>
          {dog.personalities.slice(0, 2).map((item) => (
            <View key={item.id} style={styles.personalityBadge}>
              <Text color="textTertiary" fontSize={11} lineHeight={16}>
                {item.name}
              </Text>
            </View>
          ))}
          {dog.personalities.length > 2 ? (
            <Text color="textTertiary" fontSize={11}>
              +{dog.personalities.length - 2}
            </Text>
          ) : null}
        </View>
      </View>
      <Button fullWidth={false} onPress={onEdit} size="m" type="sub">
        수정
      </Button>
    </View>
  );
}

export function CompletionScreen() {
  const router = useRouter();
  const {
    completeOnboarding,
    dogs,
    draft,
    resetDraft,
    startEdit,
  } = useOnboarding();
  const [locationSheet, setLocationSheet] = useState(false);

  const finish = () => {
    completeOnboarding();
    router.replace('/' as Href);
  };

  const requestLocation = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } finally {
      setLocationSheet(false);
      finish();
    }
  };

  const displayName = dogs[0]?.name || draft.name;

  return (
    <OnboardingPage>
      <ScrollView contentContainerStyle={styles.completionContent}>
        <ScreenTitle>등록 완료!</ScreenTitle>
        <Text color="textSecondary" fontSize={16} lineHeight={24}>
          여행 준비가 거의 끝났어요
        </Text>
        <View style={styles.dogCards}>
          {dogs.map((dog) => (
            <DogSummaryCard
              dog={dog}
              key={dog.dogId}
              onEdit={() => {
                startEdit(dog);
                router.push('/onboarding/dog/step-1' as Href);
              }}
            />
          ))}
          <Button
            leftAccessory={(
              <Icon
                name="add"
                size={20}
                tintColor={tokens.colors.semantic.light.textSecondary}
              />
            )}
            onPress={() => {
              resetDraft();
              router.push('/onboarding/dog/step-1' as Href);
            }}
            type="sub"
          >
            반려견 추가하기
          </Button>
        </View>
      </ScrollView>
      <BottomActions>
        <Button disabled={!dogs.length} onPress={() => setLocationSheet(true)}>
          완료
        </Button>
      </BottomActions>
      <BottomSheet onClose={() => setLocationSheet(false)} visible={locationSheet}>
        <View style={styles.locationSheet}>
          {isRenderableImageUri(dogs[0]?.profileImageUrl) ? (
            <SafeImage
              fallback={<DogPlaceholder compact style={styles.locationImage} />}
              source={{ uri: dogs[0].profileImageUrl }}
              style={styles.locationImage}
            />
          ) : (
            <DogPlaceholder compact />
          )}
          <Text
            fontSize={18}
            fontWeight="bold"
            lineHeight={28}
            style={styles.centerText}
          >
            <Text color="primary" fontSize={18} fontWeight="bold">
              {appendSubjectParticle(displayName)}
            </Text>{' '}
            갈 수 있는 곳만 보여드려요
          </Text>
          <Text
            color="textTertiary"
            fontSize={16}
            lineHeight={28}
            style={styles.centerText}
          >
            위치 권한을 허용하면 등록한 반려견이{`\n`}갈 수 있는 장소만 찾아볼 수 있어요
          </Text>
          <Button onPress={() => void requestLocation()}>
            위치 허용하고 장소보기
          </Button>
          <Button fullWidth onPress={finish} type="ghost">
            나중에
          </Button>
        </View>
      </BottomSheet>
    </OnboardingPage>
  );
}
