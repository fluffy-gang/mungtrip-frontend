import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/input';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { DogPlaceholder } from '@/features/onboarding/components';

import { SafeImage } from '@/features/onboarding/components/safe-image';
import { tokens } from '@/constants/tokens';
import { BREEDS } from '@/features/onboarding/constants';
import { getBreedPreset } from '@/features/onboarding/preset-assets';
import { DogEditSheet } from './dog-edit-sheet';

import type { DogSize } from '@/features/dogs/types';

const ITEM_WIDTH = 96;
const ITEM_INTERVAL = 100;
const LOOP_BREEDS = [...BREEDS, ...BREEDS, ...BREEDS];

export interface BreedSelection {
  breed: string;
  breedId?: string;
  isDangerousDog?: boolean;
  size?: DogSize;
}

interface BreedSelectionViewProps {
  initialBreed: string;
  onBack: () => void;
  onSelect: (selection: BreedSelection) => void;
}

export function BreedSelectionView({
  initialBreed,
  onBack,
  onSelect,
}: BreedSelectionViewProps) {
  const initialBreedId = BREEDS.find(item => item.name === initialBreed)?.id;
  const initialIndex = BREEDS.length
    + Math.max(BREEDS.findIndex(item => item.id === initialBreedId), 0);
  const listRef = useRef<FlatList<(typeof LOOP_BREEDS)[number]>>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [selectedId, setSelectedId] = useState(initialBreedId ?? BREEDS[0].id);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualBreed, setManualBreed] = useState(initialBreed);
  const selectedBreed = BREEDS.find(item => item.id === selectedId);

  const selectCurrentBreed = () => {
    if (!selectedBreed) return;

    onSelect({
      breed: selectedBreed.name,
      breedId: selectedBreed.id,
      isDangerousDog: selectedBreed.isDangerousDog,
      size: selectedBreed.defaultSize === 'SMALL'
        ? 'S'
        : selectedBreed.defaultSize === 'MEDIUM'
          ? 'M'
          : 'L',
    });
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="견종 선택" />
      <View style={styles.titleWrap}>
        <Text fontSize={28} fontWeight="bold" lineHeight={32}>
          우리 아이는{`\n`}어떤 친구인가요?
        </Text>
      </View>
      <View style={styles.preview}>
        {getBreedPreset(selectedId, 'selected') ? (
          <SafeImage
            contentFit="contain"
            fallback={<DogPlaceholder style={styles.previewImage} />}
            source={getBreedPreset(selectedId, 'selected')?.cover}
            style={styles.previewImage}
          />
        ) : (
          <DogPlaceholder style={styles.previewImage} />
        )}
      </View>
      <FlatList
        contentContainerStyle={[
          styles.list,
          { paddingHorizontal: Math.max((carouselWidth - ITEM_WIDTH) / 2, 0) },
        ]}
        data={LOOP_BREEDS}
        decelerationRate="fast"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          index,
          length: ITEM_INTERVAL,
          offset: ITEM_INTERVAL * index,
        })}
        horizontal
        initialScrollIndex={initialIndex}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onLayout={event => setCarouselWidth(event.nativeEvent.layout.width)}
        onMomentumScrollEnd={event => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_INTERVAL,
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
              style={styles.item}
            >
              <View style={[styles.card, selected && styles.selectedCard]}>
                {getBreedPreset(item.id, 'selected') ? (
                  <SafeImage
                    contentFit="contain"
                    fallback={<DogPlaceholder compact style={styles.thumbnail} />}
                    source={getBreedPreset(item.id, 'selected')?.profile}
                    style={styles.thumbnail}
                  />
                ) : (
                  <DogPlaceholder compact style={styles.thumbnail} />
                )}
              </View>
              <Text color={selected ? 'primary' : 'textSecondary'} fontSize={14}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_INTERVAL}
        style={styles.carousel}
      />
      <View style={styles.actions}>
        <Button disabled={!selectedBreed} onPress={selectCurrentBreed}>
          선택 했어요
        </Button>
        <View style={styles.secondaryActions}>
          <View style={styles.flex}>
            <Button fullWidth onPress={() => onSelect({ breed: '' })} type="sub">
              선택 안 할래요
            </Button>
          </View>
          <View style={styles.flex}>
            <Button fullWidth onPress={() => setManualVisible(true)} type="sub">
              직접 입력할래요
            </Button>
          </View>
        </View>
        <Text color="textDisabled" fontSize={12} style={styles.hint}>
          없을 경우 직접 입력해주세요
        </Text>
      </View>
      <DogEditSheet
        disabled={!manualBreed.trim()}
        onClose={() => setManualVisible(false)}
        onSave={() => onSelect({ breed: manualBreed.trim() })}
        title="견종을 직접 입력해주세요"
        visible={manualVisible}
      >
        <TextInputField
          autoFocus
          onChange={setManualBreed}
          placeholder="견종"
          value={manualBreed}
        />
      </DogEditSheet>
    </View>
  );
}

const colors = tokens.colors.semantic.light;

const styles = StyleSheet.create({
  actions: { gap: tokens.spacing[8], padding: tokens.spacing[20] },
  card: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: tokens.radius[16],
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  carousel: { flexGrow: 0, width: '100%' },
  flex: { flex: 1 },
  hint: { textAlign: 'center' },
  item: { alignItems: 'center', gap: tokens.spacing[8], width: ITEM_WIDTH },
  list: { gap: tokens.spacing[4] },
  preview: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  previewImage: { borderRadius: 0, height: 180, width: 260 },
  root: { backgroundColor: colors.background, flex: 1 },
  secondaryActions: { flexDirection: 'row', gap: tokens.spacing[8] },
  selectedCard: { borderColor: colors.primary, borderWidth: 2 },
  thumbnail: { borderRadius: tokens.radius[16], height: 72, width: 72 },
  titleWrap: { paddingHorizontal: tokens.spacing[20], paddingTop: tokens.spacing[24] },
});
