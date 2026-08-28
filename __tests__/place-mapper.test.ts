import {
  mapPlaceDetailResponse,
  mapPlaceListResponse,
} from '@/features/places/mapper';

const requiredPlace = {
  id: 1,
  name: '멍멍 해변',
  category: 'ATTRACTION',
  address: '제주특별자치도 제주시',
};

describe('place response mapper', () => {
  it('목록에서 필수 필드가 없거나 타입이 잘못된 항목을 제외한다', () => {
    const places = mapPlaceListResponse({
      data: {
        content: [
          requiredPlace,
          { ...requiredPlace, id: undefined },
          { ...requiredPlace, id: '2' },
          { ...requiredPlace, name: undefined },
          { ...requiredPlace, name: 2 },
          { ...requiredPlace, category: undefined },
          { ...requiredPlace, category: 2 },
          { ...requiredPlace, address: undefined },
          { ...requiredPlace, address: 2 },
        ],
      },
    });

    expect(places).toHaveLength(1);
    expect(places[0]).toMatchObject(requiredPlace);
  });

  it('상세의 필수 필드가 유효하지 않으면 명시적 형식 오류를 낸다', () => {
    expect(() =>
      mapPlaceDetailResponse({ data: { ...requiredPlace, address: null } }),
    ).toThrow('장소 응답 형식이 올바르지 않습니다.');
  });

  it.each([
    ['ATTRACTION', '관광지'],
    ['ACCOMMODATION', '동반숙소'],
  ])('상세 카테고리 코드 %s를 한국어로 표시한다', (category, categoryName) => {
    const place = mapPlaceDetailResponse({
      ...requiredPlace,
      category,
      categoryName: category,
    });

    expect(place.categoryName).toBe(categoryName);
  });

  it('선택 필드의 대체 key와 기존 호환 필드를 정규화한다', () => {
    const place = mapPlaceDetailResponse(
      {
        data: {
          placeId: 2,
          placeName: '제주 멍카페',
          categoryCode: 'CAFE',
          roadAddress: '제주특별자치도 서귀포시',
          lat: '33.2501',
          lon: '126.5602',
          photos: [{ photoUrl: 'https://example.com/place.jpg' }],
          petPolicy: '실내에서는 이동장 사용',
          tagCodes: ['SMALL_DOG'],
          openingHours: '매일 10:00~18:00',
          phone: '064-000-0000',
          website: 'https://example.com',
          verifiedAt: '2026-08-20',
          starRating: '4.8',
          reviewsCount: '12',
          official: true,
          liked: true,
          verifiedCount: '3',
        },
      },
      {
        categories: [{ code: 'CAFE', name: '카페' }],
        tags: [
          { id: 1, code: 'SMALL_DOG', name: '소형견 동반', sortOrder: 1 },
        ],
      },
    );

    expect(place).toMatchObject({
      id: 2,
      name: '제주 멍카페',
      category: 'CAFE',
      categoryName: '카페',
      address: '제주특별자치도 서귀포시',
      latitude: 33.2501,
      longitude: 126.5602,
      imageUrl: 'https://example.com/place.jpg',
      images: ['https://example.com/place.jpg'],
      petRestrictions: '실내에서는 이동장 사용',
      tagCodes: ['SMALL_DOG'],
      tags: ['소형견 동반'],
      businessHours: '매일 10:00~18:00',
      phoneNumber: '064-000-0000',
      homepageUrl: 'https://example.com',
      lastVerifiedAt: '2026-08-20',
      rating: 4.8,
      reviewCount: 12,
      isOfficial: true,
      isLiked: true,
      verifiedCount: 3,
    });
  });

  it('선택 정보가 없으면 값을 추정하지 않는다', () => {
    const place = mapPlaceDetailResponse(requiredPlace);

    expect(place).toMatchObject({
      images: [],
      tags: [],
      tagCodes: [],
      isOfficial: false,
      isLiked: false,
    });
    expect(place.latitude).toBeUndefined();
    expect(place.longitude).toBeUndefined();
    expect(place.imageUrl).toBeUndefined();
    expect(place.petRestrictions).toBeUndefined();
    expect(place.businessHours).toBeUndefined();
    expect(place.phoneNumber).toBeUndefined();
    expect(place.homepageUrl).toBeUndefined();
    expect(place.lastVerifiedAt).toBeUndefined();
  });
});
