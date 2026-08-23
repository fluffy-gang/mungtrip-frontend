import type { Course } from '@/features/courses/types';
import type { Place, PlaceCategory, PlaceTag } from '@/features/places/types';

export type HomeMode = 'map' | 'search';
export type MapSheetContent = 'content' | 'places';
export type PlaceListSource = 'category' | 'recommendation' | 'search';
export type MapSheetLevel = 'collapsed' | 'expanded';
export type DogSizeTagCode = 'SMALL_DOG' | 'MEDIUM_DOG' | 'LARGE_DOG';
export interface MapCamera {
  latitude: number;
  longitude: number;
  zoom: number;
}
export interface MapBounds {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
}
export type LocationCoordinate = Pick<MapCamera, 'latitude' | 'longitude'>;
export type LocationModule = typeof import('expo-location');
export type NativeMapModule = typeof import('@mj-studio/react-native-naver-map');

export interface HomeDogProfile {
  breed: string;
  id: number;
  imageUrl: string;
  isDangerousDog: boolean;
  name: string;
  sizeTagCode: DogSizeTagCode;
}

export interface HomeViewer {
  activeDog: HomeDogProfile | null;
  dogs: HomeDogProfile[];
  dogIds: number[];
  isLoggedIn: boolean;
  saveDogSelection: (dogIds: number[]) => void;
  selectedDogIds: number[];
  selectedDogs: HomeDogProfile[];
}

export interface HomeData {
  categories: PlaceCategory[];
  courses: Course[];
  places: Place[];
  popularKeywords: string[];
  recentlyVerified: Place[];
  tags: PlaceTag[];
  topCafePlaces: Place[];
  topRestaurantPlaces: Place[];
}
