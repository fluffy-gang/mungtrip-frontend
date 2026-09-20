import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, Text, View } from "react-native";

import { styles } from "../styles";
import { PlaceListRow } from "./place-list-row";

import type { Place } from "@/features/places/types";
import type { HomeDogProfile } from "../types";


interface PlaceListProps {
  dogs?: HomeDogProfile[];
  emptyText?: string;
  emptyTitle?: string;
  onSelectPlace?: (place: Place) => void;
  onShowMap: () => void;
  onClearFilters?: () => void;
  places: Place[];
  showMapSwitchButton?: boolean;
}

export function PlaceList({
  dogs = [],
  emptyText = "다른 검색어나 필터로 다시 찾아보세요.",
  emptyTitle = "조건에 맞는 장소가 없어요",
  onSelectPlace,
  onShowMap,
  onClearFilters,
  places,
  showMapSwitchButton = true,
}: PlaceListProps) {
  return (
    <View style={styles.listWrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {places.length > 0 ? (
          places.map((place) => (
            <PlaceListRow
              key={place.id}
              dogs={dogs}
              onPress={onSelectPlace}
              place={place}
            />
          ))
        ) : (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyListText}>{emptyText}</Text>
            {onClearFilters && <Pressable accessibilityRole="button" onPress={onClearFilters} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>필터 해제하고 전체 장소 보기</Text>
            </Pressable>}
          </View>
        )}
        <View style={styles.listBottomSpacer} />
      </ScrollView>
      {showMapSwitchButton ? (
        <Pressable
          accessibilityRole="button"
          onPress={onShowMap}
          style={styles.mapSwitchButton}
        >
          <SymbolView
            name={{ android: "map", ios: "map", web: "map" }}
            size={18}
            tintColor="#333D4B"
          />
          <Text style={styles.mapSwitchText}>지도보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
