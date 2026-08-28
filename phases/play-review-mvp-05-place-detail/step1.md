# Step 1: 방문 판단 인터페이스

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/features/places/screens/place-detail-screen.tsx`
- `src/features/home/components/place-thumbnail.tsx`
- `src/constants/tokens`
- `phases/play-review-mvp-05-place-detail/step0.md`
- `phases/play-review-mvp-03-app-information/step0.md`

## 작업
상세를 장소명/이미지 다음 `반려견 동반`, `이용 정보`, `위치와 문의` 카드 순서로 구현한다. 동반 조건·태그·영업시간·주소·전화·홈페이지·최근 확인일 중 존재하는 값만 표시하되 핵심 누락은 “정보 없음”과 사업자 확인 안내로 명시한다. 전화와 HTTPS 홈페이지만 실제 CTA로 제공하고 열기 실패를 알린다. 이미지 실패는 레이아웃을 유지하는 fallback으로 처리하며 데이터 출처를 표시한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 평점·후기·좋아요·인증 수·추천 표현을 렌더링하지 않는다.
- 값이 없는 전화/홈페이지 CTA를 만들지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
