import { Pressable, ScrollView, Text } from "react-native";

import type { PlaceCategory } from "@/features/places/types";

import { styles } from "../styles";

interface CategoryRailProps {
  activeCategoryCode: string | null;
  categories: PlaceCategory[];
  onSelectCategory: (category: PlaceCategory) => void;
}

export function CategoryRail({
  activeCategoryCode,
  categories,
  onSelectCategory,
}: CategoryRailProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.categoryRailContent}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryRail}
    >
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
