import type { PlaceProvider, PlaceSource, PlaceVisit, VisitOutcome } from '../detail/types';

export interface PlaceVisitFlowInput {
  source: PlaceSource;
  placeId: number;
  placeName?: string;
  dogId?: number;
  initialOutcome?: VisitOutcome;
  tripId?: number;
  tripItemId?: number;
}
export type PlaceVisitFlowResult =
  | { status: 'cancelled'; source: PlaceSource }
  | ({ status: 'completed'; source: PlaceSource; reviewId?: number } & PlaceVisit);
export interface PlaceVisitFlowSheetProps {
  visible: boolean;
  input: PlaceVisitFlowInput;
  provider: PlaceProvider;
  onResult(result: PlaceVisitFlowResult): void;
}
