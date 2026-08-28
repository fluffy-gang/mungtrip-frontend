import { useCallback, useState } from 'react';

const MAX_RECENT_SEARCHES = 8;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const addRecentSearch = useCallback((keyword: string) => {
    const trimmed = keyword.trim();

    if (!trimmed) {
      return;
    }

    setRecentSearches(current =>
      [trimmed, ...current.filter(item => item !== trimmed)].slice(
        0,
        MAX_RECENT_SEARCHES,
      ),
    );
  }, []);

  const removeRecentSearch = useCallback((keyword: string) => {
    setRecentSearches(current => current.filter(item => item !== keyword));
  }, []);

  return { addRecentSearch, recentSearches, removeRecentSearch };
}
