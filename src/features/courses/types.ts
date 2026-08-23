export interface Course {
  id: number;
  isLiked: boolean;
  placeCount: number;
  region: string;
  thumbnailUrl?: string;
  title: string;
  totalDistanceKm: number;
}
