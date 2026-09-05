import { createContext, useContext, useSyncExternalStore } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { bindTripSession } from './session';
import { defaultTripProvider } from './provider';

import type { TripCallbacks, TripProvider, TripSavedPort } from './types';
import type { ReactNode } from 'react';
export interface TripEnvironment {
  provider: TripProvider;
  saved?: TripSavedPort;
  callbacks?: TripCallbacks;
}
bindTripSession(defaultTripProvider, useAuthStore);
const Context = createContext<TripEnvironment>({ provider: defaultTripProvider });
/** Root supplies stable providers for the same source/session across all consumers. */
export function TripEnvironmentProvider({ children, ...value }: TripEnvironment & {
  children: ReactNode;
}) {
  if (value.saved && value.saved.source !== value.provider.source)
    throw new Error('여행과 저장의 데이터 출처가 일치하지 않습니다.');
  const snapshot = useTripSnapshot(value.provider);
  return <Context.Provider value={value}>
    <SessionContent key={snapshot.sessionRevision}>{children}</SessionContent>
  </Context.Provider>;
}
export const useTripEnvironment = () => useContext(Context);
export const useTripSnapshot = (provider: TripProvider) => useSyncExternalStore(provider.subscribe, provider.getSnapshot, provider.getSnapshot);
function SessionContent({ children }: {
  children: ReactNode;
}) { return children; }
export function TripSessionBoundary({ children }: {
  children: ReactNode;
}) {
  const { provider } = useTripEnvironment();
  const snapshot = useTripSnapshot(provider);
  return <SessionContent key={snapshot.sessionRevision}>{children}</SessionContent>;
}
