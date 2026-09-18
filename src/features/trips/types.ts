export type TripSource = 'real' | 'mock';
export type TripStatus = 'idle' | 'loading' | 'ready' | 'error';
export type MockScenario = 'populated' | 'empty' | 'error' | 'retry' | 'long-content' | 'missing-image';
export interface TripPlaceSelection {
  id: number;
  name: string;
  thumbnailUrl?: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  tags?: string[];
  isOfficial?: boolean;
  averageRating?: number;
  visitCount?: number;
}
export interface TripDog {
  dogId: number;
  name: string;
  profileImageUrl?: string;
}
export interface TripItem {
  tripItemId: number;
  sortOrder: number;
  placeId: number;
  placeName: string;
  category?: string;
  thumbnailUrl?: string;
  visitStatus?: string;
  rejectReason?: string;
  rejectDetail?: string;
}
export interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
}
export interface Trip {
  tripId: number;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
}
export interface TripBrief {
  tripId: number;
  title: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}
export interface TripSummary extends Omit<TripBrief, 'totalDays'> {
  thumbnailUrls: string[];
  totalPlaceCount: number;
  visitedPlaceCount: number;
}
export interface TripList {
  upcomingTrips: TripSummary[];
  pastTrips: TripSummary[];
}
export interface TripSnapshot extends TripList {
  readonly source: TripSource;
  readonly sessionRevision: number;
  readonly revision: number;
  readonly status: TripStatus;
  readonly loaded: boolean;
  readonly error: string | null;
  readonly details: Readonly<Record<number, Trip | undefined>>;
  readonly brief: TripBrief[];
  readonly dogs: TripDog[];
}
export interface TripCreateInput {
  title: string;
  startDate: string;
  endDate: string;
  dogIds: number[];
}
export interface TripPosition {
  tripItemId: number;
  day: number;
  sortOrder: number;
}
export interface TripEditDraft {
  baseline: Trip;
  title: string;
  items: TripPosition[];
}
export interface TripFlowInput {
  mode: 'create' | 'add';
  source: TripSource;
  selection?: {
    kind: 'place';
    places: TripPlaceSelection[];
  } | {
    kind: 'course';
    courseId: number;
    title?: string;
  };
  dogIds?: number[];
  tripId?: number;
  day?: number;
}
export type TripFlowResult = {
  status: 'completed';
  source: TripSource;
  tripId: number;
  tripItemIds: number[];
} | {
  status: 'cancelled';
  source: TripSource;
  createdTripId?: number;
};
export interface TripSearchParams {
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
export interface TripSearchResult {
  places: TripPlaceSelection[];
  page: number;
  size: number;
  totalCount: number;
}
export interface TripNearbyResult {
  places: TripPlaceSelection[];
  expandedRadiusMeters: number | null;
  expandedCount: number | null;
}
export type TripVisitAction = {
  source: TripSource;
  tripId: number;
  tripItemId: number;
  placeId: number;
  placeName: string;
};
export type TripVisitResult = {
  status: 'cancelled';
} | {
  status: 'completed';
  source: TripSource;
  placeId: number;
  outcome: 'VISITED' | 'REJECTED';
  placeVisitId?: number;
  reviewId?: number;
  rejectReason?: string;
  rejectDetail?: string;
};
/** Structural port: the saved feature remains the owner of likes and its list. */
export interface TripSavedPort {
  readonly source: TripSource;
  subscribe(listener: () => void): () => void;
  getSnapshot(): {
    sessionRevision: number;
    places: {
      items: {
        id: number;
        name: string;
        imageUrl?: string;
        category?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        tags?: string[];
      }[];
      loaded: boolean;
      status: string;
      error: string | null;
    };
    placeLikedById: Readonly<Record<number, boolean | undefined>>;
  };
  refresh(tab: 'places'): Promise<void>;
  togglePlaceLike(id: number): Promise<{
    liked: boolean;
  }>;
}
export interface TripCallbacks {
  onOpenPlace?: (input: {
    source: TripSource;
    placeId: number;
  }) => void;
  onVisit?: (input: TripVisitAction) => Promise<TripVisitResult>;
}
export interface TripTransport {
  request(config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
    params?: Record<string, unknown>;
  }): Promise<unknown>;
}
export interface TripAdapter {
  list(): Promise<TripList>;
  brief(): Promise<TripBrief[]>;
  dogs(): Promise<TripDog[]>;
  detail(id: number): Promise<Trip>;
  create(input: TripCreateInput): Promise<number>;
  addPlaces(id: number, ids: number[], day: number): Promise<number[]>;
  addCourse(id: number, courseId: number, day: number): Promise<number[]>;
  update(id: number, title: string, items: TripPosition[]): Promise<void>;
  remove(id: number): Promise<void>;
  search(params: TripSearchParams): Promise<TripSearchResult>;
  recommendations(category?: string): Promise<TripSearchResult>;
  recent(category?: string): Promise<TripSearchResult>;
  nearby(id: number): Promise<TripNearbyResult>;
  place(id: number): Promise<TripPlaceSelection>;
}
/** One immutable snapshot per revision; reset invalidates every outstanding operation. */
export interface TripProvider {
  readonly source: TripSource;
  getSnapshot(): TripSnapshot;
  subscribe(listener: () => void): () => void;
  refresh(): Promise<void>;
  refreshOptions(): Promise<void>;
  resetForSession(sessionKey?: string): void;
  getTrip(id: number): Trip | undefined;
  loadTrip(id: number): Promise<Trip>;
  create(input: TripCreateInput): Promise<number>;
  addPlaces(id: number, ids: number[], day: number): Promise<number[]>;
  addCourse(id: number, courseId: number, day: number): Promise<number[]>;
  update(id: number, draft: TripEditDraft): Promise<void>;
  remove(id: number): Promise<void>;
  search(params: TripSearchParams): Promise<TripSearchResult>;
  recommendations(category?: string): Promise<TripSearchResult>;
  recent(category?: string): Promise<TripSearchResult>;
  nearby(id: number): Promise<TripNearbyResult>;
  place(id: number): Promise<TripPlaceSelection>;
  applyVisitResult(result: TripVisitResult): Promise<void>;
  resetFixture?(scenario?: MockScenario): void;
  failNext?(operation: keyof TripAdapter): void;
}
export interface TripProviderOptions {
  source?: TripSource;
  transport?: TripTransport;
  mock?: {
    scenario?: MockScenario;
    today?: string;
  };
}
