import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getPlaces } from '@/features/places/api';
import {
  buildPlaceQueryParams,
  usePlaceExploration,
} from '@/features/home/hooks/use-place-exploration';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

jest.mock('@/features/places/api', () => ({ getPlaces: jest.fn() }));

const mockedGetPlaces = jest.mocked(getPlaces);
const bounds = { swLng: 126.1, swLat: 33.1, neLng: 127, neLat: 33.6 };
const categories: PlaceCategory[] = [];
const tags: PlaceTag[] = [];
const place = {
  id: 1,
  name: '멍멍 해변',
  category: 'ATTRACTION',
  categoryName: '관광지',
  address: '제주특별자치도 제주시',
  tags: [],
  tagCodes: [],
  isOfficial: false,
  isLiked: false,
} satisfies Place;

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, reject, resolve };
};

describe('place exploration', () => {
  beforeEach(() => {
    mockedGetPlaces.mockReset();
  });

  it('모든 탐색 조건을 단일 요청으로 만들고 빈 keyword는 생략한다', () => {
    expect(
      buildPlaceQueryParams({
        bounds,
        category: 'CAFE',
        keyword: '  ',
        page: 2,
        size: 20,
        tag: 'SMALL_DOG',
      }),
    ).toEqual({
      ...bounds,
      category: 'CAFE',
      tags: ['SMALL_DOG'],
      page: 2,
      size: 20,
    });
  });

  it('최신 요청의 결과와 매핑된 배열 길이만 반영하고 같은 조건으로 재시도한다', async () => {
    const first = deferred<Place[]>();
    const second = deferred<Place[]>();
    mockedGetPlaces
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockResolvedValueOnce([]);

    const { result, rerender } = await renderHook<
      ReturnType<typeof usePlaceExploration>,
      { keyword: string }
    >(
      ({ keyword }) =>
        usePlaceExploration({
          bounds,
          categories,
          keyword,
          tags,
        }),
      { initialProps: { keyword: '카페' } },
    );

    await rerender({ keyword: '해변' });
    await act(async () => second.resolve([place]));
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.resultCount).toBe(1);

    await act(async () => first.reject(new Error('오래된 오류')));
    expect(result.current.status).toBe('success');

    await act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('empty'));
    expect(mockedGetPlaces).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: '해변' }),
      { categories, tags },
    );
  });

  it('최신 오류 뒤에 도착한 이전 성공을 무시한다', async () => {
    const first = deferred<Place[]>();
    const second = deferred<Place[]>();
    mockedGetPlaces
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const { result, rerender } = await renderHook<
      ReturnType<typeof usePlaceExploration>,
      { keyword: string }
    >(
      ({ keyword }) =>
        usePlaceExploration({ bounds, categories, keyword, tags }),
      { initialProps: { keyword: '카페' } },
    );

    await rerender({ keyword: '해변' });
    await act(async () => second.reject(new Error('최신 오류')));
    await waitFor(() => expect(result.current.status).toBe('error'));

    await act(async () => first.resolve([place]));
    expect(result.current.status).toBe('error');
    expect(result.current.resultCount).toBe(0);
  });

  it('최초 로딩과 조건 재조회를 구분하고 재조회 중 이전 결과를 비운다', async () => {
    const initial = deferred<Place[]>();
    const refresh = deferred<Place[]>();
    mockedGetPlaces
      .mockReturnValueOnce(initial.promise)
      .mockReturnValueOnce(refresh.promise);

    const { result, rerender } = await renderHook<
      ReturnType<typeof usePlaceExploration>,
      { keyword: string }
    >(
      ({ keyword }) =>
        usePlaceExploration({ bounds, categories, keyword, tags }),
      { initialProps: { keyword: '카페' } },
    );

    expect(result.current.status).toBe('initial-loading');
    await act(async () => initial.resolve([place]));
    await waitFor(() => expect(result.current.status).toBe('success'));
    await rerender({ keyword: '해변' });
    await waitFor(() => expect(result.current.status).toBe('refreshing'));
    expect(result.current.results).toEqual([]);

    await act(async () => refresh.resolve([]));
    await waitFor(() => expect(result.current.status).toBe('empty'));
  });
});
