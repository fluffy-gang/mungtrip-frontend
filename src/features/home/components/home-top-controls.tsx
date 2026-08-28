import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { styles } from '../styles';

interface HomeTopControlsProps {
  keyword: string;
  onClearKeyword: () => void;
  onOpenSearch: () => void;
}

export function HomeTopControls({
  keyword,
  onClearKeyword,
  onOpenSearch,
}: HomeTopControlsProps) {
  return (
    <View>
      <Text style={styles.homePurpose}>제주 반려견 동반 장소를 찾아보세요</Text>
      <View style={styles.topControls}>
        <Pressable
          accessibilityLabel={keyword ? `검색어 ${keyword}, 검색 열기` : '장소 검색 열기'}
          accessibilityRole="button"
          onPress={onOpenSearch}
          style={styles.searchButton}
        >
          <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={18} tintColor="#8B95A1" />
          <Text style={styles.searchPlaceholder}>
            {keyword || '장소명으로 검색'}
          </Text>
          {keyword ? (
            <Pressable
              accessibilityLabel="검색어 초기화"
              accessibilityRole="button"
              hitSlop={8}
              onPress={event => {
                event.stopPropagation();
                onClearKeyword();
              }}
              style={styles.clearSearchButton}
            >
              <SymbolView
                name={{ android: 'close', ios: 'xmark', web: 'close' }}
                size={18}
                tintColor="#8B95A1"
              />
            </Pressable>
          ) : null}
        </Pressable>
        <Link asChild href="/info">
          <Pressable
            accessibilityLabel="앱 정보 열기"
            accessibilityRole="button"
            hitSlop={4}
            style={styles.infoButton}
          >
            <SymbolView
              name={{ android: 'info', ios: 'info.circle', web: 'info' }}
              size={22}
              tintColor="#4E5968"
            />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
