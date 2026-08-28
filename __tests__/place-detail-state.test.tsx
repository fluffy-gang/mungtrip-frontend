import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { ReactNode } from 'react';

import {
  getPlaceCategories,
  getPlaceDetail,
  getPlaceTags,
} from '@/features/places/api';
import {
  parsePlaceId,
  usePlaceDetail,
} from '@/features/places/hooks/use-place-detail';
import type { Place } from '@/features/places/types';
import { PlaceCatalogProvider } from '@/features/places/place-catalog-context';
import { ApiError } from '@/shared/api/error';

jest.mock('@/features/places/api', () => ({
  getPlaceCategories: jest.fn(),
  getPlaceDetail: jest.fn(),
  getPlaceTags: jest.fn(),
}));

const mockedGetPlaceCategories = jest.mocked(getPlaceCategories);
const mockedGetPlaceDetail = jest.mocked(getPlaceDetail);
const mockedGetPlaceTags = jest.mocked(getPlaceTags);
const place = {
  address: '제주시',
  category: 'CAFE',
  categoryName: '카페',
  id: 1,
  isLiked: false,
  isOfficial: false,
  name: '멍멍 카페',
  tagCodes: [],
  tags: [],
} satisfies Place;

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(nextResolve => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

describe('place detail state', () => {
  beforeEach(() => {
    mockedGetPlaceCategories.mockReset();
    mockedGetPlaceDetail.mockReset();
    mockedGetPlaceTags.mockReset();
  });

  it('단일 양의 정수 ID만 요청한다', async () => {
    expect(parsePlaceId('1')).toBe(1);
    expect(['0', '-1', '1.5', ' 1', ['1'], undefined].map(parsePlaceId)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ]);

    const { result, unmount } = await renderHook(() => usePlaceDetail(['1']));

    expect(result.current.status).toBe('invalid');
    expect(mockedGetPlaceDetail).not.toHaveBeenCalled();
    await unmount();
  });

  it('ID 변경 시 이전 장소와 오래된 응답을 반영하지 않는다', async () => {
    const first = deferred<Place>();
    const second = deferred<Place>();
    mockedGetPlaceDetail
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const { result, rerender, unmount } = await renderHook(
      ({ id }: { id: string }) => usePlaceDetail(id),
      { initialProps: { id: '1' } },
    );

    await rerender({ id: '2' });
    expect(result.current.status).toBe('loading');
    expect(result.current.place).toBeNull();
    await act(async () =>
      second.resolve({ ...place, id: 2, name: '새 장소' }),
    );
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => first.resolve(place));
    expect(result.current.place?.id).toBe(2);
    await unmount();
  });

  it('404와 재시도 가능한 오류를 구분한다', async () => {
    mockedGetPlaceDetail
      .mockRejectedValueOnce(new ApiError('없음', 404))
      .mockRejectedValueOnce(new ApiError('서버 오류', 500))
      .mockResolvedValueOnce(place);

    const notFound = await renderHook(() => usePlaceDetail('1'));
    await waitFor(() => expect(notFound.result.current.status).toBe('not-found'));
    await notFound.unmount();

    const retryable = await renderHook(() => usePlaceDetail('1'));
    await waitFor(() => expect(retryable.result.current.status).toBe('error'));
    await act(() => retryable.result.current.retry());
    await waitFor(() => expect(retryable.result.current.status).toBe('success'));
    await retryable.unmount();
  });

  it('공용 카탈로그의 카테고리와 태그를 상세 mapper에 전달한다', async () => {
    const categories = [{ code: 'ATTRACTION', name: '관광지' }];
    const tags = [
      { code: 'SMALL_DOG', id: 1, name: '소형견 동반', sortOrder: 1 },
    ];
    mockedGetPlaceCategories.mockResolvedValueOnce(categories);
    mockedGetPlaceTags.mockResolvedValueOnce(tags);
    mockedGetPlaceDetail.mockResolvedValueOnce(place);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PlaceCatalogProvider>{children}</PlaceCatalogProvider>
    );

    const detail = await renderHook(() => usePlaceDetail('1'), { wrapper });

    await waitFor(() => expect(detail.result.current.status).toBe('success'));
    expect(mockedGetPlaceDetail).toHaveBeenCalledWith(1, {
      categories,
      tags,
    });
    await detail.unmount();
  });
});
