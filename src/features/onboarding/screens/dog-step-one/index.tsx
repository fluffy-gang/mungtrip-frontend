import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  BottomActions,
  DogPlaceholder,
  FadeSequence,
  OnboardingPage,
  ScreenTitle,
  StepHeader,
} from '@/features/onboarding/components';

import { BREEDS } from '../../constants';
import { useOnboarding } from '../../context';
import { styles } from './style';
import { getBreedPreset } from '../../preset-assets';
import { SafeImage } from '../../components/safe-image';

import type { Href } from 'expo-router';

const BREED_ITEM_WIDTH = 96;
const BREED_ITEM_INTERVAL = 100;
const LOOP_BREEDS = [...BREEDS, ...BREEDS, ...BREEDS];

interface DogStepOneScreenProps {
  nextPath?: Href;
}

export function DogStepOneScreen({
  nextPath = '/onboarding/dog/step-2' as Href,
}: DogStepOneScreenProps = {}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { draft, loadPersonalities, setDraft } = useOnboarding();
  const initialBreed = BREEDS.find((item) => item.id === draft.breedId)
    ?? BREEDS.find((item) => item.name === draft.breed)
    ?? BREEDS[0];
  const initialBreedId = initialBreed.id;
  const initialIndex = BREEDS.length + BREEDS.indexOf(initialBreed);
  const listRef = useRef<FlatList<(typeof LOOP_BREEDS)[number]>>(null);
  const [carouselWidth, setCarouselWidth] = useState(width);
  const [selectedId, setSelectedId] = useState(initialBreedId);
  const selectedBreed = BREEDS.find((item) => item.id === selectedId);

  useEffect(() => {
    void loadPersonalities();
  }, [loadPersonalities]);

  const goNext = (mode: 'selected' | 'manual' | 'skipped') => {
    if (mode === 'selected' && selectedBreed) {
      setDraft({
        breed: selectedBreed.name,
        breedId: selectedBreed.id,
        breedInputMode: mode,
        isDangerousDog: selectedBreed.isDangerousDog,
        size: selectedBreed.defaultSize,
      });
    } else {
      setDraft({ breed: '', breedId: undefined, breedInputMode: mode });
    }
    router.push(nextPath);
  };

  return (
    <OnboardingPage>
      <StepHeader current={1} onBack={() => router.back()} />
      <View style={styles.stepTitle}>
        <FadeSequence>
          <ScreenTitle>우리 아이는{`\n`}어떤 친구인가요?</ScreenTitle>
        </FadeSequence>
      </View>
      <FadeSequence delay={80} style={styles.breedSection}>
        <View style={styles.breedPreview}>
          {getBreedPreset(selectedId, 'selected') ? (
            <SafeImage contentFit="contain" source={getBreedPreset(selectedId, 'selected')?.cover} fallback={<DogPlaceholder style={styles.breedPreviewImage} />} style={styles.breedPreviewImage} />
          ) : <DogPlaceholder style={styles.breedPreviewImage} />}
        </View>
        <FlatList
          contentContainerStyle={[
            styles.breedList,
            { paddingHorizontal: Math.max((carouselWidth - BREED_ITEM_WIDTH) / 2, 0) },
          ]}
          data={LOOP_BREEDS}
          decelerationRate="fast"
          disableIntervalMomentum
          getItemLayout={(_, index) => ({
            index,
            length: BREED_ITEM_INTERVAL,
            offset: BREED_ITEM_INTERVAL * index,
          })}
          horizontal
          initialScrollIndex={initialIndex}
          key="breed-carousel-loop"
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onLayout={(event) => setCarouselWidth(event.nativeEvent.layout.width)}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / BREED_ITEM_INTERVAL,
            );
            const loopedIndex = index < BREEDS.length
              ? index + BREEDS.length
              : index >= BREEDS.length * 2
                ? index - BREEDS.length
                : index;

            if (loopedIndex !== index) {
              listRef.current?.scrollToIndex({ animated: false, index: loopedIndex });
            }
            setSelectedId(LOOP_BREEDS[loopedIndex].id);
          }}
          ref={listRef}
          renderItem={({ index, item }) => {
            const selected = item.id === selectedId;

            return (
              <Pressable
                onPress={() => {
                  setSelectedId(item.id);
                  listRef.current?.scrollToIndex({ animated: true, index });
                }}
                style={styles.breedItem}
              >
                <View style={[styles.breedCard, selected && styles.breedCardSelected]}>
                  {getBreedPreset(item.id, 'selected') ? (
                    <SafeImage contentFit="contain" source={getBreedPreset(item.id, 'selected')?.profile} fallback={<DogPlaceholder compact style={styles.breedThumbnail} />} style={styles.breedThumbnail} />
                  ) : <DogPlaceholder compact style={styles.breedThumbnail} />}
                </View>
                <Text
                  color={selected ? 'primary' : 'textSecondary'}
                  fontFamily="rounded"
                  fontSize={14}
                  fontWeight={selected ? 'semibold' : 'regular'}
                  lineHeight={20}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={BREED_ITEM_INTERVAL}
          style={styles.breedCarousel}
        />
      </FadeSequence>
      <View style={styles.spacer} />
      <BottomActions>
        <Button disabled={!selectedBreed} onPress={() => goNext('selected')}>
          선택 했어요
        </Button>
        <View style={styles.horizontalButtons}>
          <View style={styles.flex}>
            <Button
              fullWidth
              labelStyle={styles.secondaryButtonLabel}
              onPress={() => goNext('skipped')}
              type="sub"
            >
              선택 안 할래요
            </Button>
          </View>
          <View style={styles.flex}>
            <Button
              fullWidth
              labelStyle={styles.secondaryButtonLabel}
              onPress={() => goNext('manual')}
              type="sub"
            >
              직접 입력할게요
            </Button>
          </View>
        </View>
        <Text color="textDisabled" fontSize={12} lineHeight={20} style={styles.centerText}>
          없을 경우 직접 입력해주세요
        </Text>
      </BottomActions>
    </OnboardingPage>
  );
}
