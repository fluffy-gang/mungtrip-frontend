import { Pressable, ScrollView, Text } from "react-native";

import type { PlaceCategory, PlaceTag } from "@/features/places/types";

import { styles } from "../styles";

interface CategoryRailProps {
  activeCategoryCode: string | null;
  activeTagCode: string | null;
  categories: PlaceCategory[];
  onSelectCategory: (category: PlaceCategory) => void;
  onSelectTag: (tag: string) => void;
  tags: PlaceTag[];
}

export function CategoryRail({
  activeCategoryCode,
  activeTagCode,
  categories,
  onSelectCategory,
  onSelectTag,
  tags,
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
          accessibilityLabel={`카테고리 ${category.name}`}
          accessibilityRole="button"
          accessibilityState={{ selected: activeCategoryCode === category.code }}
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
            {activeCategoryCode === category.code ? '✓ ' : ''}
            {category.name}
          </Text>
        </Pressable>
      ))}
      {tags.map(tag => (
        <Pressable
          key={tag.code}
          accessibilityLabel={`동반 조건 ${tag.name}`}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTagCode === tag.code }}
          onPress={() => onSelectTag(tag.code)}
          style={[
            styles.categoryChip,
            activeTagCode === tag.code && styles.categoryChipActive,
          ]}
        >
          <Text
            style={[
              styles.categoryChipText,
              activeTagCode === tag.code && styles.categoryChipTextActive,
            ]}
          >
            {activeTagCode === tag.code ? '✓ ' : ''}
            동반 · {tag.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
