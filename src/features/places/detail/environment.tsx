import { createContext, useContext, useSyncExternalStore } from 'react';

import { createMockPlaceAdapter } from './mock';
import { createProvider, EMPTY_PLACE_DATA } from './provider';
import { createRealPlaceAdapter } from './real-adapter';

import type { ReactNode } from 'react';
import type { PlaceVisitFlowResult } from '../visits/types';
import type { FixtureScenario, PlaceProvider, PlaceSource } from './types';

export interface SavedPlaceBridge {
  source: PlaceSource;
  getSnapshot(): { sessionRevision: number; placeLikedById: Readonly<Record<number, boolean | undefined>> };
  subscribe(listener: () => void): () => void;
  togglePlaceLike(id: number): Promise<{ liked: boolean }>;
}
export interface PlaceIntegration {
  provider?: PlaceProvider;
  saved?: SavedPlaceBridge;
  onAddToTrip?: (input: {
    mode: 'add'; source: PlaceSource;
    selection: { kind: 'place'; places: { id: number; name: string; thumbnailUrl?: string }[] };
  }) => Promise<'completed' | 'cancelled'>;
  onVisitResult?: (result: PlaceVisitFlowResult) => void;
}
const Context = createContext<PlaceIntegration>({});
/** Parent integration owns saved/trip wiring. No sibling feature runtime imports or duplicate sheets. */
export function PlaceDetailIntegrationProvider({ value, children }: { value: PlaceIntegration; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
const real = createProvider(createRealPlaceAdapter());
const mockProviders = new Map<FixtureScenario, PlaceProvider>();
export const FIXTURE_SCENARIOS: FixtureScenario[] = ['populated', 'empty', 'error', 'retry', 'long-content', 'missing-image', 'upload-failure'];
export function parseScenario(value?: string): FixtureScenario {
  return FIXTURE_SCENARIOS.find(scenario => scenario === value) ?? 'populated';
}
export function getPlaceProvider(source: PlaceSource = 'real', scenario: FixtureScenario = 'populated') {
  if (source === 'real') return real;
  let provider = mockProviders.get(scenario);
  if (!provider) { provider = createProvider(createMockPlaceAdapter({ scenario })); mockProviders.set(scenario, provider); }
  return provider;
}
export function usePlaceEnvironment(source: PlaceSource, scenario: FixtureScenario) {
  const integration = useContext(Context);
  const provider = integration.provider?.source === source ? integration.provider : getPlaceProvider(source, scenario);
  return { provider, integration };
}
export function usePlaceData(provider: PlaceProvider, id: number) {
  const snapshot = useSyncExternalStore(provider.subscribe, provider.getSnapshot, provider.getSnapshot);
  return { data: snapshot.places[id] ?? EMPTY_PLACE_DATA, sessionRevision: snapshot.sessionRevision };
}
