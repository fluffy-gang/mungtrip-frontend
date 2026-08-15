import { View } from 'react-native';

import type { Place } from '@/features/places/types';

import { styles } from '../styles';
import type { HomeDogProfile } from '../types';
import { PlaceList } from './place-list';

interface SearchResultsPanelProps {
  bottom: number;
  dogs: HomeDogProfile[];
  onSelectPlace: (place: Place) => void;
  onShowMap: () => void;
  places: Place[];
  top: number;
}

export function SearchResultsPanel({
  bottom,
  dogs,
  onSelectPlace,
  onShowMap,
  places,
  top,
}: SearchResultsPanelProps) {
  return (
    <View style={[styles.listContentPanel, { bottom, top }]}>
      <PlaceList
        dogs={dogs}
        emptyText="검색어를 바꾸거나 다른 카테고리를 선택해보세요."
        emptyTitle="검색 결과가 없어요"
        places={places}
        onSelectPlace={onSelectPlace}
        onShowMap={onShowMap}
      />
    </View>
  );
}
