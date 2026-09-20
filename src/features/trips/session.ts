import type { TripProvider } from './types';
interface AuthSnapshot {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: {
    id: number;
  } | null;
}
interface AuthPort {
  getState(): AuthSnapshot;
  subscribe(listener: (state: AuthSnapshot) => void): () => void;
}
/** Known-user token renewal preserves cache; unknown-user credential replacement does not. */
export function bindTripSession(provider: TripProvider, auth: AuthPort): () => void {
  let previous = auth.getState();
  return auth.subscribe(next => {
    const changed = previous.isLoggedIn !== next.isLoggedIn || previous.user?.id !== next.user?.id || (!next.user && previous.accessToken !== next.accessToken);
    previous = next;
    if (changed)
      provider.resetForSession();
  });
}
