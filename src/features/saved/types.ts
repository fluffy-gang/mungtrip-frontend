import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';

export type SavedSource = 'real' | 'mock';
export type SavedTab = 'places' | 'courses';
export type SavedStatus = 'idle' | 'loading' | 'refreshing' | 'error';

export interface SavedListState<T> {
  items: T[];
  loaded: boolean;
  status: SavedStatus;
  error: string | null;
  page: number;
  hasMore: boolean;
  totalCount: number;
}

export interface SavedSnapshot {
  source: SavedSource;
  places: SavedListState<Place>;
  courses: SavedListState<Course>;
  busyPlaceIds: number[];
  busyCourseIds: number[];
  updatedAt: number;
  readonly sessionRevision: number;
  readonly placeLikedById: Readonly<Record<number, boolean | undefined>>;
  readonly courseLikedById: Readonly<Record<number, boolean | undefined>>;
}

export interface SavedPlaceAction { placeId: number; source: SavedSource; }
export interface SavedCourseAction { courseId: number; source: SavedSource; }
export interface SavedMapAction { places: Place[]; source: SavedSource; }
export interface SavedTripPlacesAction { places: Place[]; source: SavedSource; }
export interface SavedTripCourseAction { course: Course; source: SavedSource; }

export interface SavedCallbacks {
  onOpenPlace?: (action: SavedPlaceAction) => void;
  onOpenCourse?: (action: SavedCourseAction) => void;
  onShowMap?: (action: SavedMapAction) => void;
  onFindPlaces?: () => void;
  onCreateOrAddTrip?: (action: SavedTripPlacesAction) => Promise<'completed' | 'cancelled'>;
  onAddCourseToTrip?: (action: SavedTripCourseAction) => Promise<'completed' | 'cancelled'>;
}

export interface SavedProvider {
  readonly source: SavedSource;
  getSnapshot: () => SavedSnapshot;
  subscribe: (listener: () => void) => () => void;
  refresh: (tab?: SavedTab) => Promise<void>;
  togglePlaceLike: (placeId: number) => Promise<{ liked: boolean }>;
  toggleCourseLike: (courseId: number) => Promise<{ liked: boolean }>;
  resetForSession: (sessionKey?: string) => void;
  resetFixture?: (scenario?: MockScenario) => void;
  dispose?: () => void;
}

export type MockScenario = 'populated' | 'empty' | 'loading' | 'error' | 'retry' | 'long-content' | 'missing-image';

export interface MockProviderOptions {
  scenario?: MockScenario;
  places?: Place[];
  courses?: Course[];
  catalogPlaces?: Place[];
  catalogCourses?: Course[];
}

export interface SavedProviderOptions {
  source?: SavedSource;
  mock?: MockProviderOptions;
  transport?: SavedTransport;
}

export interface SavedTransport {
  request: <T>(config: {
    method: 'GET' | 'POST';
    path: string;
    params?: Record<string, string | number | undefined>;
  }) => Promise<T>;
}

export interface RealSavedAdapter {
  getPlaces: (page?: number, size?: number) => Promise<{ totalCount: number; page: number; size: number; items: Place[] }>;
  getCourses: (page?: number, size?: number) => Promise<{ totalCount: number; page: number; size: number; items: Course[] }>;
  togglePlaceLike: (id: number) => Promise<{ liked: boolean }>;
  toggleCourseLike: (id: number) => Promise<{ liked: boolean }>;
}
