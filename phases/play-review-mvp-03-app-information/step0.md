# Step 0: 공개 정보 설정

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/constants`
- `src/shared/config/env.ts`
- `src/shared/api/endpoints.ts`
- `phases/play-review-mvp-01-foundation/step2.md`

## 작업
앱 표시용 데이터 출처명, 정보 정확성 안내, 공개 개인정보처리방침 URL과 지원 문의 값을 플랫폼 안전 정적 설정으로 정의한다. URL은 HTTPS이고 비어 있지 않을 때만 외부 행동을 제공하도록 validation/helper와 테스트를 만든다. 실제 운영 URL이나 문의 값이 아직 없으면 secret이나 임시 도메인을 만들지 말고 명시적 미설정 상태로 유지한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- credential, token 또는 비공개 연락처를 기록하지 않는다.
- 존재하지 않는 개인정보처리방침 URL을 만들어 넣지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
