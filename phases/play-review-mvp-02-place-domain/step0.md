# Step 0: 장소 응답 정규화

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/features/places/api.ts`
- `src/features/places/types.ts`
- `src/shared/api/client.ts`
- `phases/play-review-mvp-01-foundation/step0.md`

## 작업
목록과 상세 응답 mapper를 테스트 가능한 책임으로 정리한다. ID·장소명·카테고리·주소가 없거나 타입이 잘못된 항목은 목록에서 제외하고, 상세는 명시적 형식 오류로 처리한다. 좌표·이미지·동반 조건·태그·영업시간·연락처·홈페이지·최근 확인일의 누락과 대체 응답 key를 검증한다. 심사용 UI가 rating, review, like, verification을 렌더링하지 않아도 기존 응답 호환 타입은 유지한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- API endpoint 또는 서버 응답 계약을 변경하지 않는다.
- 누락 정보를 추정하거나 목 데이터로 채우지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
