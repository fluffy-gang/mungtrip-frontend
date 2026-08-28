# Step 1: 통합 검증

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `app.json`
- `eas.json`
- `package.json`
- `src/app`
- `phases/play-review-mvp-06-integration/step0.md`

## 작업
전체 자동 검증을 실행하고 실패 원인을 이 phase 범위에서 수정한다. resolved Expo config와 Android export/manifest에서 위치·카메라·마이크·연락처 권한, SecureStore/location plugin, secret 노출이 없는지 확인한다. 오프라인·지연·4xx/5xx·빈 결과·이미지 누락·지도 모듈 실패의 자동화 가능한 회귀 테스트를 완성하고 수동 검증 항목은 release checklist로 넘긴다.

## Acceptance Criteria
```bash
pnpm check:todos
pnpm lint
pnpm typecheck
pnpm test -- --runInBand
pnpm exec expo-doctor
pnpm exec expo export --platform android
```

## 금지사항
- 검사 실패를 suppress하거나 설정에서 제외하지 않는다.
- EAS build 또는 Play 제출을 실행하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
