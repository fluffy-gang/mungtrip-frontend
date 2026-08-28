# Step 0: 심사용 범위 정리

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/app`
- `src/features/home`
- `src/features/auth`
- `src/features/dogs`
- `src/features/courses`
- `package.json`
- `phases/play-review-mvp-04-home-exploration/step2.md`
- `phases/play-review-mvp-05-place-detail/step1.md`

## 작업
최종 route와 import graph를 기준으로 인증, 반려견 개인화, 현재 위치, 추천 코스, 최근 인증, 인기 장소, 미완성 탭과 준비 중 UI의 도달 경로를 제거한다. 참조가 완전히 사라진 심사용 dead code와 직접 의존성만 삭제하고 공통 UI·토큰·정식 앱 forward-port 대상은 보존한다. 홈에서 앱 정보 route 진입을 연결하고 모든 노출 버튼이 실제 동작하는지 확인한다.

## Acceptance Criteria
```bash
pnpm check:todos
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- 참조 여부를 확인하지 않고 feature 디렉터리를 일괄 삭제하지 않는다.
- 관련 없는 dirty file 또는 완성 앱용 공통 모듈을 되돌리지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
