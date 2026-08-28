import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getPlaces } from '@/features/places/api';
import type {
  Place,
  PlaceCategory,
  PlaceQueryParams,
  PlaceTag,
} from '@/features/places/types';

import type { MapBounds } from '../types';

export type PlaceExplorationStatus =
  | 'initial-loading'
  | 'refreshing'
  | 'success'
  | 'empty'
  | 'error';

export interface PlaceExplorationQuery {
  bounds: MapBounds;
  category?: string | null;
  keyword?: string;
  page?: number;
  size?: number;
  tag?: string | null;
}

interface UsePlaceExplorationOptions extends PlaceExplorationQuery {
  categories: PlaceCategory[];
  enabled?: boolean;
  tags: PlaceTag[];
}

export function buildPlaceQueryParams({
  bounds,
  category,
  keyword,
  page = 0,
  size = 50,
  tag,
}: PlaceExplorationQuery): PlaceQueryParams {
  const trimmedKeyword = keyword?.trim();

  return {
    ...bounds,
    ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    ...(category ? { category } : {}),
    ...(tag ? { tags: [tag] } : {}),
    page,
    size,
  };
}

export function usePlaceExploration(options: UsePlaceExplorationOptions) {
  const {
    bounds,
    categories,
    category,
    enabled = true,
    keyword,
    page,
    size,
    tag,
    tags,
  } = options;
  const { neLat, neLng, swLat, swLng } = bounds;
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] =
    useState<PlaceExplorationStatus>('initial-loading');
  const [retryKey, setRetryKey] = useState(0);
  const hasCompletedRequest = useRef(false);
  const latestRequest = useRef(0);
  const params = useMemo(
    () =>
      buildPlaceQueryParams({
        bounds: { neLat, neLng, swLat, swLng },
        category,
        keyword,
        page,
        size,
        tag,
      }),
    [
      neLat,
      neLng,
      swLat,
      swLng,
      category,
      keyword,
      page,
      size,
      tag,
    ],
  );
  const catalog = useMemo(() => ({ categories, tags }), [categories, tags]);

  useEffect(() => {
    if (!enabled) return;

    const request = ++latestRequest.current;
    void (async () => {
      await Promise.resolve();
      if (request !== latestRequest.current) return;

      // 지도 인스턴스는 유지하고 이전 조건의 마커만 먼저 제거한다.
      setResults([]);
      setStatus(hasCompletedRequest.current ? 'refreshing' : 'initial-loading');

      try {
        const nextResults = await getPlaces(params, catalog);
        if (request !== latestRequest.current) return;

        hasCompletedRequest.current = true;
        setResults(nextResults);
        setStatus(nextResults.length === 0 ? 'empty' : 'success');
      } catch {
        if (request !== latestRequest.current) return;

        hasCompletedRequest.current = true;
        setResults([]);
        setStatus('error');
      }
    })();

    return () => {
      if (request === latestRequest.current) latestRequest.current += 1;
    };
  }, [catalog, enabled, params, retryKey]);

  const retry = useCallback(() => {
    setRetryKey(current => current + 1);
  }, []);

  return {
    hasError: status === 'error',
    loading: status === 'initial-loading' || status === 'refreshing',
    resultCount: results.length,
    results,
    retry,
    status,
  };
}
