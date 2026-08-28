# Step 1: 익명 앱 부트스트랩

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/app/_layout.tsx`
- `src/features/auth/api.ts`
- `src/features/auth/useAuth.ts`
- `app.json`
- `package.json`

## 작업
앱 시작 경로에서 인증 interceptor와 저장 세션 초기화를 제거하고 SplashScreen은 root layout 준비 완료 후 숨긴다. `expo-location`과 `expo-secure-store` plugin 및 직접 의존성을 제거하고 Android resolved config에 위치 권한이 남지 않게 한다. 인증·위치 기능 파일은 아직 삭제하지 않고 실행 경로와 설정에서만 분리해 후속 통합 phase가 안전하게 dead code를 판단하도록 한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
pnpm exec expo config --type public
```

## 금지사항
- NAVER 지도 SDK를 제거하지 않는다.
- 인증/위치 외의 사용자 변경을 되돌리지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
