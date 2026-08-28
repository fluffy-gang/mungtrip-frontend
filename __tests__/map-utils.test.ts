import { getPlaceCoordinateBounds } from '@/features/home/utils/map-utils';
import type { Place } from '@/features/places/types';

const place = (id: number, latitude?: number, longitude?: number): Place => ({
  id,
  name: `장소 ${id}`,
  category: 'ATTRACTION',
  categoryName: '관광지',
  address: '제주특별자치도',
  latitude,
  longitude,
  tags: [],
  tagCodes: [],
  isOfficial: false,
  isLiked: false,
});

describe('getPlaceCoordinateBounds', () => {
  it('ignores places without finite coordinates', () => {
    expect(getPlaceCoordinateBounds([place(1), place(2, Number.NaN, 126.3)])).toBeNull();
  });

  it('returns a padded bounds for all valid result coordinates', () => {
    const bounds = getPlaceCoordinateBounds([
      place(1, 33.4, 126.3),
      place(2, 33.5, 126.5),
    ]);

    expect(bounds).not.toBeNull();
    expect(bounds?.swLat).toBeLessThan(33.4);
    expect(bounds?.swLng).toBeLessThan(126.3);
    expect(bounds?.neLat).toBeGreaterThan(33.5);
    expect(bounds?.neLng).toBeGreaterThan(126.5);
  });
});
