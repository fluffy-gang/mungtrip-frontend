# Step 0: 상세 조회 상태

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/app/places/[id].tsx`
- `src/features/places/api.ts`
- `src/features/places/types.ts`
- `src/features/places/screens/place-detail-screen.tsx`
- `phases/play-review-mvp-02-place-domain/step0.md`
- `phases/play-review-mvp-03-app-information/step0.md`

## 작업
Expo Router `id`를 단일 양의 정수로 검증한 뒤 독립 상세 요청을 수행하는 hook/state를 구현한다. loading에서 이전 장소를 재사용하지 않고 success, invalid ID, 404, network/5xx error를 구분한다. invalid/404는 뒤로가기, network error는 동일 ID retry와 뒤로가기를 제공한다. 화면 unmount 또는 ID 변경 후 오래된 응답을 반영하지 않는다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 잘못된 ID로 API 요청을 보내지 않는다.
- 상세 오류를 준비 중 화면으로 숨기지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
