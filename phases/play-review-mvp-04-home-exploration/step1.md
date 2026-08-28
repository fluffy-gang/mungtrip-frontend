# Step 1: 지도와 목록 인터페이스

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/features/home/screens/home-screen.tsx`
- `src/features/home/components/map-canvas.tsx`
- `src/features/home/components/home-map-sheet.tsx`
- `src/features/home/components/place-list.tsx`
- `src/features/home/components/place-marker.tsx`
- `src/features/home/components/place-preview-card.tsx`
- `src/features/home/styles.ts`
- `phases/play-review-mvp-04-home-exploration/step0.md`

## 작업
홈을 목적/검색 진입, 단일 카테고리·태그 칩, 지도, “이 지역 검색”, 현재 조건의 결과 수와 독립 스크롤 목록 순으로 구성한다. 마커 선택은 같은 selectedPlaceId의 요약 카드를 열고 대응 목록 행에 선택 상태를 전달한다. 목록 행과 요약 카드는 같은 장소 ID 상세로 이동한다. 지도 SDK 실패 시 오류 영역만 대체하고 목록·필터·검색·상세는 유지한다. 선택 상태는 색상 외에도 접근성 selected 상태와 형태로 표현한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 인기·추천·최근 인증 섹션을 표시하지 않는다.
- 지도 마커에 좌표가 없는 장소를 전달하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
