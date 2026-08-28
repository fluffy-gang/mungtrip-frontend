import { fireEvent, render } from '@testing-library/react-native';

import { PlaceThumbnail } from '@/features/home/components/place-thumbnail';
import { PlaceDetailScreen } from '@/features/places/screens/place-detail-screen';
import type { Place } from '@/features/places/types';
import {
  openExternalUrl,
  openExternalUrlWithFallback,
} from '@/shared/utils/open-external-url';

const mockUsePlaceDetail = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
  useRouter: () => ({ back: jest.fn() }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));
jest.mock('@/features/places/hooks/use-place-detail', () => ({
  usePlaceDetail: () => mockUsePlaceDetail(),
}));
jest.mock('@/shared/utils/open-external-url', () => ({
  openExternalUrl: jest.fn(),
  openExternalUrlWithFallback: jest.fn(),
}));

const place = {
  address: '제주시 애월읍',
  businessHours: '매일 10:00~18:00',
  category: 'CAFE',
  categoryName: '카페',
  description: '반려견과 함께 바다를 바라보며 쉴 수 있는 카페입니다.',
  homepageUrl: 'https://example.com',
  id: 1,
  imageUrl: 'https://example.com/place.jpg',
  images: [
    'https://example.com/place.jpg',
    'https://example.com/place-2.jpg',
  ],
  isLiked: false,
  isOfficial: true,
  latitude: 33.4621,
  longitude: 126.3101,
  name: '멍멍 카페',
  petRestrictions: '실내에서는 이동장 사용',
  phoneNumber: '064-000-0000',
  tagCodes: ['SMALL_DOG'],
  tags: ['소형견 동반'],
} satisfies Place;

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePlaceDetail.mockReturnValue({ place, status: 'success' });
});

it('API 값 중심의 상세 정보, 이미지 캐러셀, 외부 동작을 제공한다', async () => {
  const view = await render(<PlaceDetailScreen />);

  expect(view.getAllByRole('header').map(node => node.props.children)).toEqual([
    '멍멍 카페',
    '기타 정보',
    '주소 및 장소 정보',
  ]);
  expect(view.getByText(place.description)).toBeTruthy();
  expect(view.getByText('한국관광공사 공식 데이터')).toBeTruthy();
  expect(view.getByText('1 / 2')).toBeTruthy();

  await fireEvent.press(view.getByText('전화'));
  await fireEvent.press(view.getByText('홈페이지'));
  expect(openExternalUrl).toHaveBeenCalledWith('tel:064-000-0000', '전화 앱');
  expect(openExternalUrl).toHaveBeenCalledWith(
    'https://example.com',
    '홈페이지',
  );

  await fireEvent.press(view.getByText('네이버지도 길찾기'));
  await fireEvent.press(view.getByText('카카오맵 길찾기'));
  expect(openExternalUrlWithFallback).toHaveBeenCalledTimes(2);

  mockUsePlaceDetail.mockReturnValue({
    place: {
      ...place,
      businessHours: undefined,
      description: undefined,
      homepageUrl: 'http://example.com',
      isOfficial: false,
      petRestrictions: undefined,
      phoneNumber: undefined,
      tags: [],
    },
    status: 'success',
  });
  await view.rerender(<PlaceDetailScreen />);

  expect(view.queryByText('기타 정보')).toBeNull();
  expect(view.queryByText('한국관광공사 공식 데이터')).toBeNull();
  expect(view.queryByText('전화')).toBeNull();
  expect(view.queryByText('홈페이지')).toBeNull();

  await view.rerender(
    <PlaceThumbnail imageUrl="https://example.com/broken.jpg" style={{ height: 80 }} />,
  );

  await fireEvent(view.getByLabelText('장소 이미지'), 'error', {
    nativeEvent: { error: 'failed' },
  });
  expect(view.getByLabelText('장소 이미지 없음')).toBeTruthy();
});

it('오류 상태를 남은 높이 중앙에 배치하고 다시 시도만 제공한다', async () => {
  const retry = jest.fn();
  mockUsePlaceDetail.mockReturnValue({ place: null, retry, status: 'error' });

  const view = await render(<PlaceDetailScreen />);

  expect(view.getByTestId('place-detail-state')).toHaveStyle({
    flex: 1,
    justifyContent: 'center',
  });
  expect(view.queryByText('뒤로 가기')).toBeNull();

  await fireEvent.press(view.getByText('다시 시도'));
  expect(retry).toHaveBeenCalledTimes(1);
});
