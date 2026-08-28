import { buildExternalMapLinks } from '@/features/places/map-links';

const place = {
  address: '제주특별자치도 제주시 애월읍',
  latitude: 33.4621,
  longitude: 126.3101,
  name: '애월 반려견 동반 식당',
};

describe('external map links', () => {
  it('좌표가 있으면 네이버와 카카오 대중교통 길찾기 링크를 만든다', () => {
    expect(buildExternalMapLinks('naver', place)).toEqual({
      appUrl:
        'nmap://route/public?dlat=33.4621&dlng=126.3101&dname=%EC%95%A0%EC%9B%94%20%EB%B0%98%EB%A0%A4%EA%B2%AC%20%EB%8F%99%EB%B0%98%20%EC%8B%9D%EB%8B%B9&appname=com.mungtrip.app',
      fallbackUrl:
        'https://map.naver.com/p/search/%EC%95%A0%EC%9B%94%20%EB%B0%98%EB%A0%A4%EA%B2%AC%20%EB%8F%99%EB%B0%98%20%EC%8B%9D%EB%8B%B9%20%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC%EC%8B%9C%20%EC%95%A0%EC%9B%94%EC%9D%8D',
    });
    expect(buildExternalMapLinks('kakao', place)).toEqual({
      appUrl: 'kakaomap://route?ep=33.4621,126.3101&by=publictransit',
      fallbackUrl:
        'https://map.kakao.com/link/to/%EC%95%A0%EC%9B%94%20%EB%B0%98%EB%A0%A4%EA%B2%AC%20%EB%8F%99%EB%B0%98%20%EC%8B%9D%EB%8B%B9,33.4621,126.3101',
    });
  });

  it('좌표가 없으면 지도 검색 결과로 연결한다', () => {
    const links = buildExternalMapLinks('kakao', {
      address: place.address,
      name: place.name,
    });

    expect(links.appUrl).toContain('kakaomap://search?q=');
    expect(links.fallbackUrl).toContain('https://map.kakao.com/link/search/');
  });
});
