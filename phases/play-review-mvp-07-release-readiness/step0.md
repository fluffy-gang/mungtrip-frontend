# Step 0: 릴리즈 증빙

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `.github`
- `app.json`
- `eas.json`
- `phases/play-review-mvp-06-integration/step1.md`

## 작업
저장소 안에 release checklist와 증빙 기록 양식을 만든다. production API 카테고리·태그·목록·검색·대표 상세, NAVER Maps, 개인정보처리방침 URL, 콘텐츠 30건/카테고리 3개/대표 상세 10건, 권한·SDK·네트워크 대상, 스토어 설명·스크린샷 일치 여부를 기록할 수 있어야 한다. 실제 실행 식별값은 환경에서 확인된 값만 기록하고 credential은 남기지 않는다.

## Acceptance Criteria
```bash
pnpm check:todos
pnpm lint
pnpm typecheck
pnpm test -- --runInBand
```

## 금지사항
- production credential, token, 서명키를 문서에 기록하지 않는다.
- 확인하지 않은 항목을 통과로 표시하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
