import { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import type { Place } from '@/features/places/types';

import { colors, styles } from '../styles';

interface SearchViewProps {
  insetsTop: number;
  onBack: () => void;
  onSelectKeyword: (keyword: string) => void;
  places: Place[];
  query: string;
  setQuery: (value: string) => void;
}

export function SearchView({
  insetsTop,
  onBack,
  onSelectKeyword,
  places,
  query,
  setQuery,
}: SearchViewProps) {
  const renderHighlightedName = (name: string) => {
    const trimmedQuery = query.trim();
    const matchIndex = trimmedQuery
      ? name.toLowerCase().indexOf(trimmedQuery.toLowerCase())
      : -1;

    if (matchIndex === -1) {
      return <Text style={styles.suggestionText}>{name}</Text>;
    }

    const before = name.slice(0, matchIndex);
    const match = name.slice(matchIndex, matchIndex + trimmedQuery.length);
    const after = name.slice(matchIndex + trimmedQuery.length);

    return (
      <Text style={styles.suggestionText}>
        {before}
        <Text style={styles.suggestionHighlightText}>{match}</Text>
        {after}
      </Text>
    );
  };

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
        <Pressable
          accessibilityLabel="검색 닫기"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <SymbolView name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }} size={24} tintColor="#191F28" />
        </Pressable>
        <View style={styles.searchInputShell}>
          <SymbolView
            name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }}
            size={18}
            tintColor={colors.textPlaceholder}
          />
          <TextInput
            accessibilityLabel="장소명 검색어"
            autoFocus
            onChangeText={setQuery}
            onSubmitEditing={() => {
              if (query.trim()) {
                onSelectKeyword(query.trim());
              }
            }}
            placeholder="제주도 강아지 장소 검색"
            placeholderTextColor={colors.textPlaceholder}
            returnKeyType="search"
            style={styles.searchTextInput}
            value={query}
          />
        </View>
      </View>
      {suggestions.length > 0 ? (
        <View style={styles.searchSection}>
          <Text style={styles.searchSectionTitle}>장소 바로가기</Text>
          {suggestions.map(place => (
            <Pressable
              key={place.id}
              accessibilityLabel={`${place.name}, 검색`}
              accessibilityRole="button"
              onPress={() => onSelectKeyword(place.name)}
              style={styles.suggestionRow}
            >
              <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={18} tintColor="#8B95A1" />
              {renderHighlightedName(place.name)}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
