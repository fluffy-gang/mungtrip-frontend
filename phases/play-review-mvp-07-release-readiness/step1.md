# Step 1: 운영자 인계

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `phases/play-review-mvp-07-release-readiness/step0.md`

## 작업
Android 7/16, 작은 화면, 태블릿, TalkBack, 글자 확대, 외부 링크와 지도/API 장애 수동 검증 결과를 checklist에 반영한다. 운영자 문의 이메일·개인정보처리방침 URL·담당자, EAS build ID, versionName/versionCode와 production 환경 이름이 없으면 이 step을 `blocked`로 표시하고 필요한 값만 구체적으로 적는다. 값과 접근 권한이 모두 제공된 경우에도 EAS build, Play Console 업로드·승격·제출은 직접 수행하지 않고 실행 가능한 운영자 명령과 동일 AAB 승격 절차만 인계한다.

## Acceptance Criteria
```bash
pnpm check:todos
pnpm lint
pnpm typecheck
pnpm test -- --runInBand
```

## 금지사항
- EAS login/build/submit 또는 Play Console 변경을 실행하지 않는다.
- 테스트하지 않은 기기·정책 항목을 완료로 표시하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
