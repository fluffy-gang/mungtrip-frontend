import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { styles } from '../styles';
import type { HomeDogProfile } from '../types';

interface HomeTopControlsProps {
  activeDog: HomeDogProfile | null;
  onOpenDogSelector: () => void;
  onOpenSearch: () => void;
  selectedDogs: HomeDogProfile[];
  top: number;
}

export function HomeTopControls({
  activeDog,
  onOpenDogSelector,
  onOpenSearch,
  selectedDogs,
  top,
}: HomeTopControlsProps) {
  const visibleDogs =
    selectedDogs.length > 0 ? selectedDogs : activeDog ? [activeDog] : [];

  return (
    <View style={[styles.topControls, { top }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpenDogSelector}
        style={styles.dogSelector}
      >
        <View style={styles.dogAvatarStack}>
          {visibleDogs.length === 0 ? (
            <SymbolView
              name={{ android: 'pets', ios: 'pawprint.fill', web: 'pets' }}
              size={22}
              tintColor="#6B7684"
            />
          ) : null}
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
          <Text style={styles.dogSelectorText}>
            {activeDog?.name ?? '반려견 선택'}
          </Text>
        ) : null}
        <SymbolView name={{ android: 'keyboard_arrow_down', ios: 'chevron.down', web: 'keyboard_arrow_down' }} size={16} tintColor="#6B7684" />
      </Pressable>
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
