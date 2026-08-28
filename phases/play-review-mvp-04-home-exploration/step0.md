# Step 0: 홈 탐색 상태

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/features/home/hooks/use-home-screen.ts`
- `src/features/home/types.ts`
- `src/features/home/constants.ts`
- `src/features/home/utils/map-utils.ts`
- `phases/play-review-mvp-02-place-domain/step1.md`
- `phases/play-review-mvp-03-app-information/step1.md`

## 작업
홈 상태를 keyword, 단일 category, 단일 tag, committedBounds, draftBounds, results, selectedPlaceId로 단순화하고 통합 탐색 hook에 연결한다. 지도 이동은 draftBounds만 갱신하며 “이 지역 검색”에서만 committedBounds로 승격한다. “조건 초기화”는 검색·카테고리·태그만 지우고 확정 bounds를 유지한다. 상세 복귀 시 조건과 결과 상태를 유지한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 현재 위치, 반려견 또는 추천 상태를 새 탐색 모델에 남기지 않는다.
- 지도 이동만으로 API 요청을 실행하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
