# 프런트엔드 아키텍처

이 앱은 아직 초기 단계의 Expo Router 프로젝트다. 공통 코드는 찾기 쉽고 재사용하기 쉬워야 하지만, 구조는 가볍게 유지한다.

## 현재 스택

- Expo SDK 57
- React Native 0.86
- React 19.2.3
- typed routes가 활성화된 Expo Router
- styled-components/native
- TypeScript strict mode

## 모듈 경계

- `src/app`: route 파일과 route layout만 둔다.
- `src/components`: 재사용 UI 컴포넌트
- `src/components/ui`: 공통 UI 프리미티브
- `src/hooks`: 여러 화면에서 쓰는 React hook
- `src/constants`: 디자인 토큰, 앱 상수, 플랫폼 안전 정적 설정
- `src/constants/tokens`: 토큰 프리미티브와 공개 aggregate 진입점
- `src/features/{feature}`: 기능이 한 route를 넘어서 커지면 UI, hook, helper를 함께 둔다.

## 공통 코드

새 코드를 추가하기 전에 이미 있는 컴포넌트, hook, helper, constant를 먼저 찾는다. 동작이 재사용되거나 책임 경계가 안정적이면 먼저 공통 모듈을 만들고 구현에서 사용한다.

공통 모듈에는 공개 동작, 플랫폼 전제, 타입만으로는 드러나지 않는 제약을 간결한 주석으로 남긴다.

## Expo 및 React Native 규칙

- Expo 또는 React Native API를 추가하기 전에는 SDK 57 문서를 먼저 확인한다.
- 토큰 기반 스타일이 반복되기 시작하면 재사용 공통 UI 프리미티브에는 `styled-components/native`를 사용한다.
- 내비게이션은 `expo-router` API를 우선한다.
- 동작이 다르면 `.ios`, `.android`, `.web` 접미사로 플랫폼 파일을 명시한다.
- SDK 57 문서가 요구하지 않는 한 외부 `@react-navigation/*` 패키지를 앱 레벨에서 직접 import하지 않는다.
- 기능이 커질수록 route 파일은 얇게 유지하고, 재사용 로직은 feature 또는 공통 모듈로 옮긴다.
- `src/app` route 파일은 빈 placeholder 또는 얇은 composition layer로 유지하고, 스타일 프리미티브는 `src/components/ui`로 옮긴다.

## 엔지니어링 기준

- 정확성, 보안, 유지보수성, 명확한 소유권을 우선한다.
- 반복이나 도메인 형태가 충분하지 않으면 큰 추상화는 만들지 않는다.
- 받아들인 예외 사항은 ADR 또는 PR 메모로 남긴다.
- 미뤄둔 작업은 이슈나 ADR 링크로 추적 가능하게 남긴다.
