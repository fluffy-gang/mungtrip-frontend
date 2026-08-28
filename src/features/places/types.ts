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
  page?: number;
  size?: number;
}
