import { fireEvent, render, screen } from '@testing-library/react-native';

import { CategoryRail } from '@/features/home/components/category-rail';
import { HomeMapSheet } from '@/features/home/components/home-map-sheet';
import { PlaceListRow } from '@/features/home/components/place-list-row';
import { SearchView } from '@/features/home/components/search-view';
import type { Place } from '@/features/places/types';

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');

  return {
    __esModule: true,
    default: { View },
    Easing: { cubic: undefined, out: () => undefined },
    useAnimatedStyle: (createStyle: () => object) => createStyle(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
  };
});

const place = {
  address: '제주시 작은 화면에서도 확인할 수 있는 긴 주소',
  category: 'CAFE',
  categoryName: '카페',
  id: 1,
  isLiked: false,
  isOfficial: false,
  name: '멍멍 카페',
  tagCodes: ['SMALL_DOG'],
  tags: ['소형견 동반 가능', '실내 동반'],
} satisfies Place;

describe('home search and recovery UI', () => {
  it('최근·인기 검색 없이 익명 키워드 입력만 제공한다', async () => {
    await render(
      <SearchView
        insetsTop={0}
        onBack={jest.fn()}
        onSelectKeyword={jest.fn()}
        places={[place]}
        query="멍멍"
        setQuery={jest.fn()}
      />,
    );

    expect(screen.queryByText('최근 검색')).toBeNull();
    expect(screen.queryByText('인기 검색')).toBeNull();
    expect(screen.getByLabelText('검색 닫기')).toHaveStyle({ height: 44, width: 44 });
    expect(screen.getByLabelText('장소명 검색어')).toHaveProp(
      'placeholderTextColor',
      '#8B95A1',
    );
    expect(screen.getByLabelText('멍멍 카페, 검색')).toHaveStyle({ minHeight: 44 });
  });

  it('필터 선택과 장소 상세 목적을 TalkBack 순서로 전달한다', async () => {
    const { getByLabelText } = await render(
      <>
        <CategoryRail
          activeCategoryCode="CAFE"
          activeTagCode="SMALL_DOG"
          categories={[{ code: 'CAFE', name: '카페' }]}
          onSelectCategory={jest.fn()}
          onSelectTag={jest.fn()}
          tags={[{ code: 'SMALL_DOG', id: 1, name: '소형견', sortOrder: 1 }]}
        />
        <PlaceListRow onPress={jest.fn()} place={place} />
      </>,
    );

    expect(getByLabelText('카테고리 카페')).toHaveProp('accessibilityState', {
      selected: true,
    });
    expect(getByLabelText('카테고리 카페')).toHaveStyle({ minHeight: 44 });
    expect(
      getByLabelText('멍멍 카페, 카페, 대표 동반 조건 소형견 동반 가능, 상세로 이동'),
    ).toHaveStyle({ minHeight: 116 });
  });

  it('empty 복구와 error retry를 서로 다른 상태로 제공한다', async () => {
    const onResetConditions = jest.fn();
    const onRetry = jest.fn();
    const props = {
      height: 240,
      onResetConditions,
      onRetry,
      onSelectPlace: jest.fn(),
      onShowMap: jest.fn(),
      panHandlers: {},
      places: [],
      status: 'empty' as const,
    };
    const view = await render(<HomeMapSheet {...props} />);

    await fireEvent.press(screen.getByText('조건 초기화'));
    expect(onResetConditions).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('제주 전체 보기')).toBeNull();
    expect(screen.queryByText('다시 시도')).toBeNull();

    await view.rerender(<HomeMapSheet {...props} status="error" />);
    await fireEvent.press(screen.getByText('다시 시도'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('조건 초기화')).toBeNull();
  });
});
