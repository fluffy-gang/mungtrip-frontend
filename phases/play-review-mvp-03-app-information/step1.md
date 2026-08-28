# Step 1: 앱 정보 화면

## 읽어야 할 파일
- `docs/superpowers/specs/2026-08-26-play-review-mvp/PRD.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ARCHITECTURE.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/DESIGN.md`
- `docs/superpowers/specs/2026-08-26-play-review-mvp/ADR.md`
- `src/app/_layout.tsx`
- `src/components/ui/screen.tsx`
- `src/components/ui/text.tsx`
- `src/constants/tokens`
- `phases/play-review-mvp-03-app-information/step0.md`

## 작업
Expo Router의 `/info` route와 `src/features/app-info` 화면을 추가한다. 데이터 출처, 정보 한계와 방문 전 사업자 확인 안내, 지원 문의, 개인정보처리방침 행동을 표시한다. 미설정 링크는 무반응 CTA 대신 준비에 필요한 명확한 안내를 표시하고, 외부 열기 실패를 사용자에게 알린다. 뒤로가기, TalkBack label, 44×44dp 터치 영역과 글자 확대를 지원한다.

## Acceptance Criteria
```bash
pnpm test -- --runInBand
pnpm lint
pnpm typecheck
```

## 금지사항
- `@react-navigation/*`를 직접 import하지 않는다.
- WebView로 개인정보처리방침을 내장하지 않는다.
- 기존 테스트를 삭제하거나 완화하지 않는다.
- Git mutation을 실행하지 않는다.
