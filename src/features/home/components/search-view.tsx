import { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { SEARCH_PLACEHOLDER } from '../constants';
import { styles } from '../styles';

import type { Place } from '@/features/places/types';


interface SearchViewProps {
  insetsTop: number;
  onBack: () => void;
  onRemoveRecentSearch: (keyword: string) => void;
  onSelectKeyword: (keyword: string) => void;
  places: Place[];
  popularKeywords: string[];
  query: string;
  recentSearches: string[];
  setQuery: (value: string) => void;
}

export function SearchView({
  insetsTop,
  onBack,
  onRemoveRecentSearch,
  onSelectKeyword,
  places,
  popularKeywords,
  query,
  recentSearches,
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
            placeholder={SEARCH_PLACEHOLDER}
            returnKeyType="search"
            style={styles.searchTextInput}
            value={query}
          />
        </View>
      </View>


      {!query.trim() && recentSearches.length > 0 ? (
        <View style={styles.searchSection}>
          <Text style={styles.searchSectionTitle}>최근 검색</Text>
          <View style={styles.keywordWrap}>
            {recentSearches.map(keyword => (
              <Pressable
                key={keyword}
                accessibilityRole="button"
                onPress={() => onSelectKeyword(keyword)}
                style={styles.recentSearchPill}
              >
                <Text style={styles.recentSearchPillText}>{keyword}</Text>
                <Pressable
                  accessibilityLabel={`${keyword} 최근 검색 삭제`}
                  accessibilityRole="button"
                  onPress={() => onRemoveRecentSearch(keyword)}
                  style={styles.recentSearchRemoveButton}
                >
                  <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={14} tintColor="#8B95A1" />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

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
              {renderHighlightedName(place.name)}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
