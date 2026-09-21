import { getPlaces } from './api';

import type { PlaceCatalog } from './detail/catalog-mapping';
import type { Place, PlaceQueryParams } from './types';

const TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  expiresAt: number;
  promise: Promise<Place[]>;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(params: PlaceQueryParams | undefined): string {
  const { dogIds, tags, ...rest } = params ?? {};
  return JSON.stringify({
    ...rest,
    dogIds: dogIds ? [...dogIds].sort((a, b) => a - b) : undefined,
    tags: tags ? [...tags].sort() : undefined,
  });
}

/**
 * 지도 뷰포트 장소 조회(`getPlaces`)만을 위한 5분 TTL 캐시. 같은 조건의 요청은
 * 캐시가 유효한 동안 네트워크를 다시 타지 않고, 진행 중인 동일 요청은 재사용해
 * 지도 이동마다 중복 호출되는 것을 막는다. 실패한 요청은 캐시에 남기지 않아
 * 다음 호출에서 바로 재시도된다. 키워드 검색(`usePlaceSearch`)은 최신 결과가
 * 중요하므로 이 캐시를 거치지 않고 `getPlaces`를 직접 호출한다.
 */
export function getCachedMapPlaces(
  params: PlaceQueryParams | undefined,
  catalog?: PlaceCatalog,
): Promise<Place[]> {
  const key = cacheKey(params);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = getPlaces(params, catalog).catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { expiresAt: Date.now() + TTL_MS, promise });
  return promise;
}
