export interface ReviewDogSummary {
  breed: string;
  imageUrl?: string;
  name: string;
  size: string;
  weight?: number;
}

export interface Review {
  content: string;
  createdAt: string;
  dog: ReviewDogSummary | null;
  imageUrls: string[];
  placeId: number;
  placeName: string;
  rating: number;
  reviewId: number;
  updatedAt: string;
}

export interface VisitedPlace {
  hasReview: boolean;
  placeId: number;
  placeName: string;
  thumbnailUrl?: string;
  visitedAt: string;
}

export interface CreateReviewRequest {
  content: string;
  dogId: number;
  imageUrls: string[];
  rating: number;
}

export interface UpdateReviewRequest {
  content: string;
  rating: number;
}
