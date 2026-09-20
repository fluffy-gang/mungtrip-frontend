# 0002: Web auth and deployment boundary

- Status: accepted
- Decision: deploy Expo Router as a single client rendered app to Vercel `dist`, with a catch all rewrite and restrictive response headers. Web auth uses localStorage for session tokens and sessionStorage for short lived OAuth state; native auth continues to use SecureStore through the same async storage interface.
- Security: browser storage is readable by injected JavaScript, so XSS can expose bearer tokens. CSP limits script origins and other headers reduce browser attack surface, but neither makes localStorage equivalent to HttpOnly cookies. Do not store provider client secrets in the bundle.
- Follow up: move web sessions to Secure, HttpOnly, SameSite cookies when the backend supports same-site session endpoints, CSRF protection, refresh/logout semantics and the production/staging origins are aligned. Document and deploy that backend contract before switching the client.
- Backend contract: Kakao web authorization returns a code to `/onboarding/oauth/kakao`; exchange with `POST /api/v1/auth/social-login/kakao/code` and `{ code, redirectUri, deviceId }`, using the existing `SocialLoginResponse`. Restore endpoint expansion remains a backend follow up; clients must display missing endpoint failures.
- `vercel.json` CSP `connect-src` must stay aligned with each environment's `EXPO_PUBLIC_API_URL`; keep temporary `https://dev.mungtrip.site` until its API use ends, and update CSP and Vercel env together when production API origin is selected.
