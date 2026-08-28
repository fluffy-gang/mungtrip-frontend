import { Pressable, ScrollView, Text, View } from "react-native";

import type { Place } from "@/features/places/types";

import { styles } from "../styles";
import { PlaceListRow } from "./place-list-row";

interface PlaceListProps {
  emptyText?: string;
  emptyTitle?: string;
  onSelectPlace?: (place: Place) => void;
  onShowMap: () => void;
  places: Place[];
  selectedPlaceId?: number;
  showMapSwitchButton?: boolean;
}

export function PlaceList({
  emptyText = "다른 검색어나 필터로 다시 찾아보세요.",
  emptyTitle = "조건에 맞는 장소가 없어요",
  onSelectPlace,
  onShowMap,
  places,
  selectedPlaceId,
  showMapSwitchButton = true,
}: PlaceListProps) {
  return (
    <View style={styles.listWrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {places.length > 0 ? (
          places.map((place) => (
            <PlaceListRow
              key={place.id}
              onPress={onSelectPlace}
              place={place}
              selected={place.id === selectedPlaceId}
            />
          ))
        ) : (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyListText}>{emptyText}</Text>
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
          <Text style={styles.mapSwitchText}>지도보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
