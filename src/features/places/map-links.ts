import type { Place } from './types';

export type MapProvider = 'naver' | 'kakao';

export interface ExternalMapLinks {
  appUrl: string;
  fallbackUrl: string;
}

const APP_IDENTIFIER = 'com.mungtrip.app';

const getSearchQuery = (place: Pick<Place, 'address' | 'name'>) =>
  encodeURIComponent(`${place.name} ${place.address}`.trim());

/** 목적지 좌표가 없으면 각 지도 서비스의 장소 검색으로 안전하게 대체한다. */
export function buildExternalMapLinks(
  provider: MapProvider,
  place: Pick<Place, 'address' | 'latitude' | 'longitude' | 'name'>,
): ExternalMapLinks {
  const encodedName = encodeURIComponent(place.name);
  const searchQuery = getSearchQuery(place);
  const hasCoordinate =
    Number.isFinite(place.latitude) && Number.isFinite(place.longitude);

  if (provider === 'naver') {
    return hasCoordinate
      ? {
          appUrl:
            `nmap://route/public?dlat=${place.latitude}` +
            `&dlng=${place.longitude}&dname=${encodedName}` +
            `&appname=${APP_IDENTIFIER}`,
          fallbackUrl: `https://map.naver.com/p/search/${searchQuery}`,
        }
      : {
          appUrl:
            `nmap://search?query=${searchQuery}` +
            `&appname=${APP_IDENTIFIER}`,
          fallbackUrl: `https://map.naver.com/p/search/${searchQuery}`,
        };
  }

  return hasCoordinate
    ? {
        appUrl:
          `kakaomap://route?ep=${place.latitude},${place.longitude}` +
          '&by=publictransit',
        fallbackUrl:
          `https://map.kakao.com/link/to/${encodedName},` +
          `${place.latitude},${place.longitude}`,
      }
    : {
        appUrl: `kakaomap://search?q=${searchQuery}`,
        fallbackUrl: `https://map.kakao.com/link/search/${searchQuery}`,
      };
}
