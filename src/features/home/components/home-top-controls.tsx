import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { styles } from '../styles';
import type { HomeDogProfile } from '../types';

interface HomeTopControlsProps {
  activeDog: HomeDogProfile | null;
  onAddDog: () => void;
  onOpenDogSelector: () => void;
  onOpenSearch: () => void;
  selectedDogs: HomeDogProfile[];
}

export function HomeTopControls({
  activeDog,
  onAddDog,
  onOpenDogSelector,
  onOpenSearch,
  selectedDogs,
}: HomeTopControlsProps) {
  const visibleDogs =
    selectedDogs.length > 0 ? selectedDogs : activeDog ? [activeDog] : [];

  return (
    <View style={styles.topControls}>
      {activeDog === null ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAddDog}
          style={styles.dogSelectorEmpty}
        >
          <Text style={styles.dogSelectorAddText}>반려견 추가</Text>
          <SymbolView name={{ android: 'add', ios: 'plus', web: 'add' }} size={14} tintColor="#FE6A20" />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenDogSelector}
          style={styles.dogSelector}
        >
          <View style={styles.dogAvatarStack}>
            {visibleDogs.slice(0, 2).map((dog, index) => (
              <Image
                key={dog.id}
                contentFit="cover"
                source={{ uri: dog.imageUrl }}
                style={[
                  styles.stackedDogAvatar,
                  { marginLeft: index === 0 ? 0 : -10 },
                ]}
              />
            ))}
          </View>
          {selectedDogs.length <= 1 ? (
            <Text style={styles.dogSelectorText}>{activeDog.name}</Text>
          ) : null}
          <SymbolView name={{ android: 'keyboard_arrow_down', ios: 'chevron.down', web: 'keyboard_arrow_down' }} size={16} tintColor="#6B7684" />
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={onOpenSearch}
        style={styles.searchButton}
      >
        <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={18} tintColor="#8B95A1" />
        <Text style={styles.searchPlaceholder}>제주도 강아지 장소 검색</Text>
      </Pressable>
    </View>
  );
}
