interface Identity { isLoggedIn: boolean; user: { id: number; provider?: string } | null; accessToken: string | null }
/** Known-user token refresh preserves state; unresolved identity credential replacement does not. */
export function samePlaceSession(previous: Identity, next: Identity): boolean {
  if (previous.isLoggedIn !== next.isLoggedIn) return false;
  if (!next.isLoggedIn) return true;
  if (previous.user?.id !== next.user?.id || previous.user?.provider !== next.user?.provider) return false;
  return next.user?.id !== undefined || previous.accessToken === next.accessToken;
}
