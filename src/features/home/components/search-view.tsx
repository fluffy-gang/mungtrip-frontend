import { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import type { Place } from '@/features/places/types';

import { styles } from '../styles';

interface SearchViewProps {
  insetsTop: number;
  onBack: () => void;
  onSelectKeyword: (keyword: string) => void;
  places: Place[];
  popularKeywords: string[];
  query: string;
  setQuery: (value: string) => void;
}

export function SearchView({
  insetsTop,
  onBack,
  onSelectKeyword,
  places,
  popularKeywords,
  query,
  setQuery,
}: SearchViewProps) {
  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return places
      .filter(place => place.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 4);
  }, [places, query]);

  return (
    <View style={[styles.searchRoot, { paddingTop: insetsTop + 8 }]}>
      <View style={styles.searchHeader}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <SymbolView name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }} size={24} tintColor="#191F28" />
        </Pressable>
        <View style={styles.searchInputShell}>
          <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={18} tintColor="#8B95A1" />
          <TextInput
            autoFocus
            onChangeText={setQuery}
            onSubmitEditing={() => {
              if (query.trim()) {
                onSelectKeyword(query.trim());
              }
            }}
            placeholder="제주도 강아지 장소 검색"
            returnKeyType="search"
            style={styles.searchTextInput}
            value={query}
          />
        </View>
      </View>


      <View style={styles.searchSection}>
        <Text style={styles.searchSectionTitle}>이번달 인기 장소</Text>
        <View style={styles.keywordWrap}>
          {popularKeywords.map(keyword => (
            <Pressable
              key={keyword}
              accessibilityRole="button"
              onPress={() => onSelectKeyword(keyword)}
              style={[styles.keywordPill, styles.hotKeywordPill]}
            >
              <Text style={styles.hotKeywordText}>{keyword}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {suggestions.length > 0 ? (
        <View style={styles.searchSection}>
          <Text style={styles.searchSectionTitle}>장소 바로가기</Text>
          {suggestions.map(place => (
            <Pressable
              key={place.id}
              accessibilityRole="button"
              onPress={() => onSelectKeyword(place.name)}
              style={styles.suggestionRow}
            >
              <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={18} tintColor="#8B95A1" />
              <Text style={styles.suggestionText}>{place.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
