# Step 2: 릴리즈 설정

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `app.json`
- `package.json`
- `src/shared/config/env.ts`

## 작업
`eas.json`을 추가해 `cli.appVersionSource`를 `remote`로, production Android profile을 AAB와 `autoIncrement: true`로 설정한다. 앱 display name `멍멍트립`, package `com.mungtrip.app`, version `1.0.0`, 기존 projectId와 아이콘·스플래시 설정을 유지한다. 공개 가능한 API URL과 NAVER Maps Client ID 외에 secret이 resolved Expo config에 포함되지 않는지 검사 가능한 테스트를 추가한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
pnpm exec expo config --type public
```

## 금지사항
- EAS login, build, submit을 실행하지 않는다.
- credential 또는 secret 값을 파일에 기록하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
