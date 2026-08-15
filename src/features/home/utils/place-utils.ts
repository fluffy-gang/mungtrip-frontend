import type { Place, PlaceCategory } from '@/features/places/types';

export const filterPlaces = (
  places: Place[],
  query: string,
  category?: PlaceCategory,
): Place[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return places.filter(place => {
    const matchesCategory = !category || place.category === category.code;
    const matchesQuery =
      !normalizedQuery ||
      [
        place.name,
        place.category,
        place.categoryName,
        place.address,
        place.description,
        ...place.tags,
        ...place.tagCodes,
      ]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
};

export const getImageSource = (imageUrl?: string) => {
  return imageUrl ? { uri: imageUrl } : undefined;
};

export const hasPlaceCoordinate = (
  place: Place,
): place is Place & { latitude: number; longitude: number } => {
  return place.latitude !== undefined && place.longitude !== undefined;
};