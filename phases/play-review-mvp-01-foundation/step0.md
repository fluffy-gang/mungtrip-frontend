# Step 0: 테스트 기반

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `AGENTS.md`
- `package.json`
- `tsconfig.json`

## 작업
Expo SDK 57의 고정 버전 테스트 문서를 확인한 뒤 `jest-expo` preset과 React Native Testing Library를 개발 의존성으로 설치한다. `package.json`에 비감시 단발 실행용 `test` script를 추가하고 TypeScript alias를 인식하는 최소 Jest 설정과 smoke test를 만든다. 기존 `clean:cache`, `start:clean` 변경과 다른 사용자 변경을 보존한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- npm/yarn lockfile을 추가하지 않는다.
- 제품 코드를 이 step에서 변경하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
