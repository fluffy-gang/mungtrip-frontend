import type { LocationCoordinate, MapBounds, MapCamera } from '../types';
import type { Place, PlaceCategory } from '@/features/places/types';

export interface MapCanvasProps {
  mapCamera: MapCamera;
  onSelectPlace: (place: Place) => void;
  onUserMove?: () => void;
  places: Place[];
  selectedCategory?: PlaceCategory;
  selectedPlaceId?: number;
  setMapBounds: (bounds: MapBounds) => void;
  setMapCamera: (camera: MapCamera) => void;
  userCoordinate: LocationCoordinate | null;
  userProfileImageUrl?: string;
}
