# Step 2: 검색과 복구 상태

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/features/home/components/search-view.tsx`
- `src/features/home/components/category-rail.tsx`
- `src/features/home/components/place-list-row.tsx`
- `src/features/home/screens/home-screen.tsx`
- `src/features/home/styles.ts`
- `phases/play-review-mvp-04-home-exploration/step1.md`

## 작업
키워드를 기존 category, tag, committedBounds와 결합하고 최근 검색·인기 검색 UI와 영구 저장을 제거한다. 초기 로딩, 재조회, 성공, empty, error, retry를 구분하고 “총 N곳”, “조건 초기화” 문구를 적용한다. 결과 수·필터 선택·장소명·대표 동반 조건·상세 진입의 TalkBack 읽기 순서, 44×44dp 터치 영역, 글자 확대와 작은 화면 레이아웃을 검증한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 검색어를 세션 또는 영구 저장소에 기록하지 않는다.
- empty와 error를 같은 상태로 처리하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
