# Step 1: 통합 탐색 요청

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/features/home/hooks/use-map-places.ts`
- `src/features/home/hooks/use-place-search.ts`
- `src/features/home/hooks/use-async-effect.ts`
- `src/features/home/types.ts`
- `src/features/places/api.ts`
- `phases/play-review-mvp-02-place-domain/step0.md`

## 작업
키워드, 단일 카테고리, 단일 태그, 확정 bounds, page/size를 하나의 `PlaceQueryParams` 요청으로 만드는 탐색 hook을 정의한다. 빈 keyword는 생략하고 선택 태그는 `tags: [code]`로 전송한다. 요청 세대 번호 또는 AbortController를 사용해 가장 최근 요청의 성공·오류만 상태에 반영한다. 결과 수는 정상 매핑된 배열 길이로 계산하고 loading, success, empty, error와 동일 조건 retry를 노출한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 전체 결과 개수 metadata를 가정하지 않는다.
- 복수 카테고리 또는 복수 태그 선택을 추가하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
