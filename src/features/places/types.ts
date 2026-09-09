export interface PlaceCategory {
  code: string;
  name: string;
  icon?: string;
}

export interface PlaceTag {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

export interface Place {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  address: string;
  detailAddress?: string;
  zip?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  distanceLabel?: string;
  phoneNumber?: string;
  homepageUrl?: string;
  businessHours?: string;
  businessHourEntries?: BusinessHourEntry[];
  operationStatus?: string;
  nextOpenAt?: string;
  petRestrictions?: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  tags: string[];
  tagCodes: string[];
  isOfficial: boolean;
  isLiked: boolean;
  verifiedCount?: number;
  recentVisitedCount?: number;
  lastVerifiedAt?: string;
  rank?: number;
}

export interface PlaceQueryParams {
  keyword?: string;
  swLng?: number;
  swLat?: number;
  neLng?: number;
  neLat?: number;
  category?: string;
  tags?: string[];
  dogIds?: number[];
  page?: number;
  size?: number;
}

export interface TopPlacesQueryParams {
  category: string;
  limit?: number;
  days?: number;
}

/** Structured hours returned by SDK-facing place detail API; the legacy string stays optional. */
export interface BusinessHourEntry {
  day: string;
  open: string;
  close: string;
}
