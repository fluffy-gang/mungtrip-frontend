import { Image } from 'react-native';

import { createSavedProvider, savedProvider } from '@/features/saved';
import { getPlaceProvider } from '@/features/places/detail/environment';
import { createMockPlaceAdapter } from '@/features/places/detail/mock';
import { createProvider } from '@/features/places/detail/provider';
import { MOCK_PLACES } from '@/features/trips/mock';
import { createTripProvider, defaultTripProvider } from '@/features/trips/provider';

import type { TripSource } from '@/features/trips/types';
import type { Place } from '@/features/places/types';


const real = { source: 'real' as const, saved: savedProvider, trips: defaultTripProvider, places: getPlaceProvider() };
let mock: FeatureProviders | undefined;

/** Fixtures share IDs across features; production never falls back to this catalog. */
function createMockProviders() {
  const imageUrl = Image.resolveAssetSource(require('../saved/assets/place-fixture.webp')).uri;
  const catalog: Place[] = MOCK_PLACES.map(place => ({
    ...place, category: place.category ?? 'CAFE',
    categoryName: place.category === 'ATTRACTION' ? '관광지' : place.category === 'RESTAURANT' ? '식당' : '카페',
    address: place.address ?? '', imageUrl, images: [imageUrl],
    tags: place.tags ?? [], tagCodes: [], isLiked: true, isOfficial: false,
  }));
  return {
    source: 'mock' as const,
    catalog,
    saved: createSavedProvider({ source: 'mock', mock: { places: catalog, courses: [{
      id: 201, title: '제주 바다와 함께하는 하루', region: '애월', placeCount: 3,
      totalDistanceKm: 2, isLiked: true,
      thumbnailUrl: Image.resolveAssetSource(require('../saved/assets/course-fixture.webp')).uri,
    }] } }),
    trips: createTripProvider({ source: 'mock' }),
    places: createProvider(createMockPlaceAdapter({ catalog })),
  };
}
export type FeatureProviders = Omit<typeof real, 'source'> & { source: TripSource; catalog?: Place[] };
/** Stable providers preserve selections and mutations across route pushes and tab changes. */
export function getFeatureProviders(source: TripSource): FeatureProviders {
  if (source === 'real') return real;
  mock ??= createMockProviders();
  return mock;
}
