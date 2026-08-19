import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { PlaceCategory } from "@/features/places/types";

import { styles } from "../styles";
import type { HomeDogProfile } from "../types";

interface CategoryRailProps {
  activeCategoryCode: string | null;
  activeDog: HomeDogProfile | null;
  categories: PlaceCategory[];
  onAddDog: () => void;
  onOpenDogSelector: () => void;
  onSelectCategory: (category: PlaceCategory) => void;
  selectedDogs: HomeDogProfile[];
}

export function CategoryRail({
  activeCategoryCode,
  activeDog,
  categories,
  onAddDog,
  onOpenDogSelector,
  onSelectCategory,
  selectedDogs,
}: CategoryRailProps) {
  const visibleDogs =
    selectedDogs.length > 0 ? selectedDogs : activeDog ? [activeDog] : [];

  return (
    <ScrollView
      contentContainerStyle={styles.categoryRailContent}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryRail}
    >
      {activeDog === null ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAddDog}
          style={styles.dogSelectorEmpty}
        >
          <Text style={styles.dogSelectorAddText}>반려견 추가</Text>
          <SymbolView name={{ android: "add", ios: "plus", web: "add" }} size={14} tintColor="#FE6A20" />
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
          <SymbolView name={{ android: "keyboard_arrow_down", ios: "chevron.down", web: "keyboard_arrow_down" }} size={16} tintColor="#6B7684" />
        </Pressable>
      )}
      {categories.map((category) => (
        <Pressable
          key={category.code}
          accessibilityRole="button"
          onPress={() => onSelectCategory(category)}
          style={[
            styles.categoryChip,
            activeCategoryCode === category.code && styles.categoryChipActive,
          ]}
        >
          <Text
            style={[
              styles.categoryChipText,
              activeCategoryCode === category.code &&
                styles.categoryChipTextActive,
            ]}
          >
            {category.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
