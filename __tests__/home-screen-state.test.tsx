import { act, renderHook } from '@testing-library/react-native';

import { JEJU_MAP_BOUNDS } from '@/features/home/constants';
import { useHomeScreen } from '@/features/home/hooks/use-home-screen';
import { usePlaceExploration } from '@/features/home/hooks/use-place-exploration';
import type { Place } from '@/features/places/types';

const mockRouterPush = jest.fn();
const mockShowMap = jest.fn();
const mockShowPlacesCollapsed = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ push: mockRouterPush }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));
jest.mock('@/features/home/hooks/use-map-sheet-controller', () => ({
  useMapSheetController: () => ({
    floatingActionBottom: 0,
    height: 200,
    isExpanded: false,
    mapFloatingActionIcon: 'map',
    mapFloatingActionText: '지도',
    panHandlers: {},
    showMap: mockShowMap,
    showPlacesCollapsed: mockShowPlacesCollapsed,
    toggleContent: jest.fn(),
    zoomControlBottom: 0,
  }),
}));
jest.mock('@/features/home/hooks/use-place-catalog', () => ({
  usePlaceCatalog: () => ({
    categories: [{ code: 'CAFE', name: '카페' }],
    hasError: false,
    isLoaded: true,
    loading: false,
    tags: [{ code: 'SMALL_DOG', id: 1, name: '소형견', sortOrder: 1 }],
  }),
}));
jest.mock('@/features/home/hooks/use-place-exploration', () => ({
  usePlaceExploration: jest.fn(),
}));

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
const nextBounds = { neLat: 33.4, neLng: 126.8, swLat: 33.2, swLng: 126.4 };
const mockedUsePlaceExploration = jest.mocked(usePlaceExploration);

describe('home exploration state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePlaceExploration.mockReturnValue({
      hasError: false,
      loading: false,
      resultCount: 1,
      results: [place],
      retry: jest.fn(),
      status: 'success',
    });
  });

  it('지도 bounds는 명시적으로 확정하고 두 초기화 범위를 구분한다', async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await act(() => result.current.setDraftBounds(nextBounds));
    expect(result.current.committedBounds).toEqual(JEJU_MAP_BOUNDS);
    expect(mockedUsePlaceExploration).toHaveBeenLastCalledWith(
      expect.objectContaining({ bounds: JEJU_MAP_BOUNDS }),
    );

    await act(() => result.current.searchCurrentArea());
    expect(result.current.committedBounds).toEqual(nextBounds);
    expect(mockedUsePlaceExploration).toHaveBeenLastCalledWith(
      expect.objectContaining({ bounds: nextBounds }),
    );

    await act(() => {
      result.current.submitSearch(' 카페 ');
      result.current.selectCategory({ code: 'CAFE', name: '카페' });
      result.current.selectTag('SMALL_DOG');
      result.current.resetConditions();
    });
    expect(result.current.keyword).toBe('');
    expect(result.current.category).toBeNull();
    expect(result.current.tag).toBeNull();
    expect(result.current.committedBounds).toEqual(nextBounds);

  });

  it('상세 이동 뒤에도 탐색 조건과 결과를 유지한다', async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await act(() => result.current.submitSearch('카페'));
    await act(() => result.current.selectPlace(place));

    expect(result.current.keyword).toBe('카페');
    expect(result.current.results).toEqual([place]);
    expect(result.current.selectedPlaceId).toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith({
      params: { id: '1' },
      pathname: '/places/[id]',
    });
  });

  it('새 키워드 검색은 기존 카테고리와 태그 조건을 초기화한다', async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await act(() => result.current.selectCategory({ code: 'CAFE', name: '카페' }));
    await act(() => result.current.selectTag('SMALL_DOG'));
    expect(result.current.category).toBe('CAFE');
    expect(result.current.tag).toBe('SMALL_DOG');

    await act(() => result.current.submitSearch('오름'));

    expect(result.current.keyword).toBe('오름');
    expect(result.current.category).toBeNull();
    expect(result.current.tag).toBeNull();
  });

  it('빈 검색어는 현재 keyword를 유지하고 새 요청을 만들지 않는다', async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await act(() => result.current.submitSearch('카페'));
    await act(() => result.current.submitSearch('   '));

    expect(result.current.keyword).toBe('카페');
    expect(mockedUsePlaceExploration).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: '카페' }),
    );
  });

  it('검색어 초기화는 장소 검색 조건만 해제한다', async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await act(() => result.current.submitSearch('오름'));
    await act(() => result.current.selectCategory({ code: 'CAFE', name: '카페' }));
    await act(() => result.current.clearKeyword());

    expect(result.current.keyword).toBe('');
    expect(result.current.query).toBe('');
    expect(result.current.category).toBe('CAFE');
  });
});
