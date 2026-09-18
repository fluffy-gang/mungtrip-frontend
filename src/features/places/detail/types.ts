import type { Place } from '../types';

export type PlaceSource = 'real' | 'mock';
export type VisitOutcome = 'VISITED' | 'REJECTED';
export type RejectReason = 'NO_ENTRY_FOR_DOGS' | 'CROWDED' | 'CLOSED' | 'HARD_TO_ACCESS' | 'OTHER';
export interface DogChoice { id: number; name: string; breed?: string; weight?: number }
export interface ReviewDog { name?: string; breed?: string; size?: string; weight?: number }
export interface ReviewItem {
  type: 'REVIEW' | 'REJECTED';
  reviewId?: number;
  userNickname?: string;
  reviewerVisitCount?: number;
  rating?: number;
  content?: string;
  imageUrls: string[];
  rejectReason?: RejectReason;
  rejectDetail?: string;
  dog?: ReviewDog;
  occurredAt?: string;
}
export interface ReviewFeed {
  averageRating?: number;
  visitedCount?: number;
  items: ReviewItem[];
  hasNext: boolean;
}
export interface PlaceReview {
  reviewId: number;
  placeId: number;
  rating: number;
  content?: string;
  imageUrls: string[];
  dog?: ReviewDog;
  createdAt?: string;
}
export interface ReviewInput { rating: number; content: string; dogId?: number; imageUrls: string[] }
export interface VisitInput {
  outcome: VisitOutcome;
  visitedAt?: string;
  rejectReason?: RejectReason;
  rejectDetail?: string;
}
export interface PlaceVisit extends VisitInput { placeVisitId: number; placeId: number }
export interface NearbyResult { places: Place[]; expandedRadiusMeters?: number; expandedCount?: number }
export interface SelectedPhoto { uri: string; mimeType: string }
export interface Resource<T> { data?: T; loading: boolean; error?: string }
export interface PlaceData {
  detail: Resource<Place>;
  reviews: Resource<ReviewFeed> & { page: number };
  nearby: Resource<NearbyResult>;
}
export interface PlaceSnapshot {
  sessionRevision: number;
  places: Readonly<Record<number, PlaceData | undefined>>;
}
/** One fixed data source per provider; upload results are stored references, never preview URIs. */
export interface PlaceAdapter {
  source: PlaceSource;
  detail(id: number): Promise<Place>;
  reviews(id: number, page: number): Promise<ReviewFeed>;
  nearby(id: number, radius?: number): Promise<NearbyResult>;
  visit(id: number, input: VisitInput): Promise<PlaceVisit>;
  myReview(id: number): Promise<PlaceReview | null>;
  createReview(id: number, input: ReviewInput): Promise<PlaceReview>;
  updateReview(id: number, input: Pick<ReviewInput, 'rating' | 'content'>): Promise<PlaceReview>;
  upload(photo: SelectedPhoto): Promise<string>;
  dogs(): Promise<DogChoice[]>;
  reset?(): void;
  subscribeSession?(onChange: () => void): () => void;
}
export type FixtureScenario = 'populated' | 'empty' | 'error' | 'retry' | 'long-content' | 'missing-image' | 'upload-failure';
export interface PlaceProvider {
  readonly source: PlaceSource;
  getSnapshot(): PlaceSnapshot;
  subscribe(listener: () => void): () => void;
  loadDetail(id: number): Promise<void>;
  loadReviews(id: number, more?: boolean): Promise<void>;
  loadNearby(id: number, radius?: number): Promise<void>;
  visit(id: number, input: VisitInput): Promise<PlaceVisit>;
  myReview(id: number): Promise<PlaceReview | null>;
  saveReview(id: number, input: ReviewInput, existing?: PlaceReview): Promise<PlaceReview>;
  upload(photo: SelectedPhoto): Promise<string>;
  dogs(): Promise<DogChoice[]>;
  resetForSession(sessionKey?: string): void;
  dispose(): void;
}
