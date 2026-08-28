import type { Place, PlaceCategory, PlaceTag } from './types';

export interface PlaceCatalog {
  categories?: PlaceCategory[];
  tags?: PlaceTag[];
}

type ApiObject = Record<string, unknown>;

const CATEGORY_NAMES: Record<string, string> = {
  ACCOMMODATION: '동반숙소',
  ACTIVITY: '놀거리/체험',
  ATTRACTION: '관광지',
  CAFE: '카페',
  CARE: '돌봄',
  FACILITY: '편의시설',
  GROOMING: '미용',
  HOSPITAL: '동물병원',
  RESTAURANT: '식당',
  SHOPPING: '쇼핑',
  TRAINING: '훈련',
};

const ARRAY_KEYS = [
  'items',
  'content',
  'places',
  'categories',
  'tags',
  'keywords',
  'data',
] as const;

const isObject = (value: unknown): value is ApiObject => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const unwrapData = (value: unknown): unknown => {
  return isObject(value) && 'data' in value ? value.data : value;
};

const findArrayPayload = (value: unknown): unknown[] => {
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

const getString = (source: ApiObject, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const getNumber = (source: ApiObject, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
};

const getPlaceId = (source: ApiObject): number | undefined => {
  for (const key of ['id', 'placeId']) {
    const value = source[key];

    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }
  }

  return undefined;
};

const getBoolean = (source: ApiObject, keys: string[]): boolean => {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return Boolean(source[key]);
    }
  }

  return false;
};

const getArray = (source: ApiObject, keys: string[]): unknown[] => {
  for (const key of keys) {
    if (Array.isArray(source[key])) {
      return source[key];
    }
  }

  return [];
};

const getImages = (source: ApiObject): string[] => {
  return getArray(source, ['images', 'imageUrls', 'photos'])
    .map(value => {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      return isObject(value)
        ? getString(value, ['url', 'imageUrl', 'photoUrl', 'originalUrl'])
        : undefined;
    })
    .filter((value): value is string => Boolean(value));
};

interface TagEntry {
  code: string;
  name?: string;
}

const getTagEntries = (value: unknown): TagEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (typeof item === 'string' && item.trim()) {
        return { code: item.trim() };
      }

      if (!isObject(item)) {
        return undefined;
      }

      const name = getString(item, ['name', 'tagName', 'label']);
      const code = getString(item, ['code']) ?? name;

      return code ? { code, name } : undefined;
    })
    .filter((entry): entry is TagEntry => Boolean(entry));
};

const mapCategory = (value: unknown): PlaceCategory | null => {
  const source = isObject(value) ? value : {};
  const code = getString(source, ['code']);
  const name = getString(source, ['name']);

  if (!code || !name) {
    return null;
  }

  return {
    code,
    name,
    icon: getString(source, ['icon', 'emoji', 'iconUrl']),
  };
};

const mapTag = (value: unknown): PlaceTag | null => {
  const source = isObject(value) ? value : {};
  const id = getNumber(source, ['id']);
  const code = getString(source, ['code']);
  const name = getString(source, ['name']);
  const sortOrder = getNumber(source, ['sortOrder']);

  if (id === undefined || !code || !name || sortOrder === undefined) {
    return null;
  }

  return { id, code, name, sortOrder };
};

const mapPlace = (value: unknown, catalog?: PlaceCatalog): Place | null => {
  if (!isObject(value)) {
    return null;
  }

  const id = getPlaceId(value);
  const name = getString(value, ['name', 'placeName', 'title']);
  const category = getString(value, ['category', 'categoryCode']);
  const address = getString(value, ['address', 'roadAddress', 'region']);

  if (id === undefined || !name || !category || !address) {
    return null;
  }

  const images = getImages(value);
  const imageUrl =
    getString(value, ['thumbnailUrl', 'imageUrl', 'thumbnail', 'photoUrl']) ??
    images[0];
  const payloadTags = getTagEntries(value.tags);
  const codeTags = getTagEntries(value.tagCodes);
  const tagEntries = codeTags.length > 0 ? codeTags : payloadTags;
  const tagCodes = tagEntries.map(tag => tag.code);
  const tags = tagEntries.map((tag, index) => {
    return (
      catalog?.tags?.find(catalogTag => catalogTag.code === tag.code)?.name ??
      payloadTags.find(payloadTag => payloadTag.code === tag.code)?.name ??
      payloadTags[index]?.name ??
      tag.name ??
      tag.code
    );
  });
  const distance = getNumber(value, ['distance', 'distanceKm']);
  const distanceLabel =
    getString(value, ['distanceLabel', 'distanceText']) ??
    (distance !== undefined
      ? `${distance.toFixed(distance >= 10 ? 0 : 1)}km`
      : undefined);
  const catalogCategoryName = catalog?.categories?.find(
    item => item.code === category,
  )?.name;
  const payloadCategoryName = getString(value, ['categoryName']);
  const categoryName =
    catalogCategoryName ??
    (payloadCategoryName && payloadCategoryName !== category
      ? payloadCategoryName
      : CATEGORY_NAMES[category]) ??
    category;

  return {
    id,
    name,
    category,
    categoryName,
    address,
    detailAddress: getString(value, ['detailAddress']),
    zip: getString(value, ['zip']),
    description: getString(value, ['description', 'summary', 'intro']),
    imageUrl,
    images,
    distanceLabel,
    phoneNumber: getString(value, ['phoneNumber', 'phone', 'telephone']),
    homepageUrl: getString(value, [
      'homepageUrl',
      'homepage',
      'websiteUrl',
      'website',
    ]),
    businessHours: getString(value, [
      'businessHours',
      'openingHours',
      'operatingHours',
    ]),
    petRestrictions: getString(value, [
      'petRestrictions',
      'petPolicy',
      'petInfo',
    ]),
    rating: getNumber(value, ['rating', 'starRating', 'score']),
    reviewCount: getNumber(value, ['reviewCount', 'reviewsCount']),
    latitude: getNumber(value, ['mapy', 'latitude', 'lat']),
    longitude: getNumber(value, ['mapx', 'longitude', 'lng', 'lon']),
    tags,
    tagCodes,
    isOfficial: getBoolean(value, ['isOfficial', 'official']),
    isLiked: getBoolean(value, ['isLiked', 'liked', 'bookmarked']),
    verifiedCount: getNumber(value, ['verifiedCount']),
    lastVerifiedAt: getString(value, [
      'lastVerifiedAt',
      'verifiedAt',
      'lastCheckedAt',
    ]),
    rank: getNumber(value, ['rank']),
  };
};

export const mapPlaceListResponse = (
  value: unknown,
  catalog?: PlaceCatalog,
): Place[] => {
  return findArrayPayload(unwrapData(value))
    .map(place => mapPlace(place, catalog))
    .filter((place): place is Place => place !== null);
};

export const mapPlaceDetailResponse = (
  value: unknown,
  catalog?: PlaceCatalog,
): Place => {
  const place = mapPlace(unwrapData(value), catalog);

  if (!place) {
    throw new Error('장소 응답 형식이 올바르지 않습니다.');
  }

  return place;
};

export const mapCategoryListResponse = (value: unknown): PlaceCategory[] => {
  return findArrayPayload(unwrapData(value))
    .map(mapCategory)
    .filter((category): category is PlaceCategory => category !== null);
};

export const mapTagListResponse = (value: unknown): PlaceTag[] => {
  return findArrayPayload(unwrapData(value))
    .map(mapTag)
    .filter((tag): tag is PlaceTag => tag !== null)
    .sort((firstTag, secondTag) => firstTag.sortOrder - secondTag.sortOrder);
};
