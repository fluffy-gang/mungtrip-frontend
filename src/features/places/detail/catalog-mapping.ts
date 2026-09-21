import type { Place, PlaceCategory, PlaceTag } from '../types';

export interface PlaceCatalog {
  categories?: PlaceCategory[];
  tags?: PlaceTag[];
}

type ApiObject = Record<string, unknown>;

const ARRAY_KEYS = [
  'items',
  'content',
  'places',
  'categories',
  'tags',
  'keywords',
  'data',
] as const;

export const isObject = (value: unknown): value is ApiObject => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

export const findArrayPayload = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isObject(value)) {
    return [];
  }

  for (const key of ARRAY_KEYS) {
    const payload = value[key];

    if (Array.isArray(payload)) {
      return payload;
    }

    if (isObject(payload)) {
      const nestedPayload = findArrayPayload(payload);

      if (nestedPayload.length > 0) {
        return nestedPayload;
      }
    }
  }

  return [];
};

export const getObjectValue = (source: ApiObject, keys: string[]): unknown => {
  return keys
    .map(key => source[key])
    .find(value => value !== undefined && value !== null);
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

export const toString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }

      if (isObject(item)) {
        return toString(getObjectValue(item, ['code', 'name', 'tagName', 'label']));
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
};

const getCategoryName = (categoryCode: string, catalog?: PlaceCatalog): string => {
  return (
    catalog?.categories?.find(category => category.code === categoryCode)?.name ??
    categoryCode
  );
};

const getTagNames = (tagCodes: string[], catalog?: PlaceCatalog): string[] => {
  return tagCodes.map(
    tagCode => catalog?.tags?.find(tag => tag.code === tagCode)?.name ?? tagCode,
  );
};

export const mapCategory = (value: unknown): PlaceCategory | null => {
  const source = isObject(value) ? value : {};
  const code = toString(getObjectValue(source, ['code']));
  const name = toString(getObjectValue(source, ['name']));

  if (!code || !name) {
    return null;
  }

  return {
    code,
    name,
    icon: toString(getObjectValue(source, ['icon', 'emoji', 'iconUrl'])),
  };
};

export const mapTag = (value: unknown): PlaceTag | null => {
  const source = isObject(value) ? value : {};
  const id = toNumber(getObjectValue(source, ['id']));
  const code = toString(getObjectValue(source, ['code']));
  const name = toString(getObjectValue(source, ['name']));
  const sortOrder = toNumber(getObjectValue(source, ['sortOrder']));

  if (id === undefined || !code || !name || sortOrder === undefined) {
    return null;
  }

  return {
    id,
    code,
    name,
    sortOrder,
  };
};

export const mapPlace = (
  value: unknown,
  catalog?: PlaceCatalog,
): Place | null => {
  const source = isObject(value) ? value : {};
  const id = toNumber(getObjectValue(source, ['id', 'placeId']));
  const name = toString(getObjectValue(source, ['name', 'placeName', 'title']));
  const category = toString(
    getObjectValue(source, ['category', 'categoryCode']),
  );
  const address = toString(
    getObjectValue(source, ['address', 'roadAddress', 'region']),
  );

  if (id === undefined || !name || !category) {
    return null;
  }

  const images = toStringArray(getObjectValue(source, ['images']));
  const imageUrl =
    toString(
      getObjectValue(source, ['thumbnailUrl', 'imageUrl', 'thumbnail', 'photoUrl']),
    ) ?? images[0];
  const tagCodes = toStringArray(getObjectValue(source, ['tags', 'tagCodes']));
  const distance = toNumber(getObjectValue(source, ['distance', 'distanceKm']));
  const distanceLabel =
    toString(getObjectValue(source, ['distanceLabel', 'distanceText'])) ??
    (distance !== undefined
      ? `${distance.toFixed(distance >= 10 ? 0 : 1)}km`
      : undefined);

  return {
    id,
    name,
    category,
    categoryName: getCategoryName(category, catalog),
    address,
    detailAddress: toString(getObjectValue(source, ['detailAddress'])),
    zip: toString(getObjectValue(source, ['zip'])),
    description: toString(getObjectValue(source, ['description', 'summary', 'intro'])),
    imageUrl,
    images,
    distanceLabel,
    phoneNumber: toString(getObjectValue(source, ['phoneNumber'])),
    homepageUrl: toString(getObjectValue(source, ['homepageUrl'])),
    businessHours: toString(getObjectValue(source, ['businessHours'])),
    businessHourEntries: Array.isArray(source.businessHours)
      ? source.businessHours.flatMap(hour => isObject(hour) &&
          typeof hour.day === 'string' && typeof hour.open === 'string' &&
          typeof hour.close === 'string'
        ? [{ day: hour.day, open: hour.open, close: hour.close }] : [])
      : undefined,
    operationStatus: toString(source.operationStatus),
    nextOpenAt: toString(source.nextOpenAt),
    recentVisitedCount: toNumber(source.recentVisitedCount),
    petRestrictions: toString(getObjectValue(source, ['petRestrictions'])),
    rating: toNumber(getObjectValue(source, ['averageRating', 'rating', 'starRating', 'score'])),
    reviewCount: toNumber(getObjectValue(source, ['reviewCount', 'reviewsCount'])),
    latitude: toNumber(getObjectValue(source, ['mapy', 'latitude', 'lat'])),
    longitude: toNumber(getObjectValue(source, ['mapx', 'longitude', 'lng', 'lon'])),
    tags: getTagNames(tagCodes, catalog),
    tagCodes,
    isOfficial: Boolean(getObjectValue(source, ['isOfficial', 'official'])),
    isLiked: Boolean(getObjectValue(source, ['isLiked', 'liked', 'bookmarked'])),
    verifiedCount: toNumber(getObjectValue(source, ['visitedCount', 'verifiedCount'])),
    lastVerifiedAt: toString(getObjectValue(source, ['lastVerifiedAt'])),
    rank: toNumber(getObjectValue(source, ['rank'])),
  };
};

export const mapPlaces = (value: unknown, catalog?: PlaceCatalog): Place[] => {
  return findArrayPayload(value)
    .map(place => mapPlace(place, catalog))
    .filter((place): place is Place => place !== null);
};
