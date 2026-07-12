# 0001. 공통 스타일 토큰

- 상태: 승인됨
- 날짜: 2026-07-12

## Context

Figma 온보딩, 버튼, 프로필 설정, 지도, 장소 목록 화면에서 공통 색상, 간격, 타이포그래피, radius, border, shadow가 반복된다. 현재 앱은 Expo SDK 57, React Native 0.86, React 19.2.3, Expo Router를 사용하며 별도 스타일링 라이브러리는 도입하지 않았다.

## Decision

공통 스타일 값은 `src/constants/tokens/`에 primitive token과 semantic token으로 나눈다. `src/constants/tokens/index.ts`는 공개 aggregate 진입점이고 `types.ts`는 타입 전용 진입점이다.

- Primitive color는 `orange`, `gray`, `black`, `blue` 색상군과 Figma에서 관측된 shade 값만 정의한다. 미관측 shade는 추정해서 채우지 않는다.
- `gray`는 Figma의 `colors.gray0`부터 `colors.gray900`까지의 scale을 따른다. 순수 검정은 gray scale에 섞지 않고 `black` primitive로 분리한다.
- 이번 구현에서는 opacity shade 계층을 만들지 않는다. 반투명 효과는 shadow opacity처럼 해당 토큰의 속성으로만 표현한다.
- 현재 제품 지원 범위는 light theme이며 앱 런타임도 light로 고정한다. Dark theme는 별도 디자인 확인 후 추가한다.
- Figma에서 쓰는 폰트는 Pretendard와 Hakgyoansim Dunggeunmiso 두 가지뿐이므로 font token도 두 family만 노출한다.
- Typography는 semantic text style을 만들지 않고 `fontSize`와 `letterSpacing`을 함께 묶은 primitive scale, 그리고 `fontWeight`만 정의한다.
- Expo SDK 57의 `expo-font` config plugin으로 Pretendard 400/500/600/700과 Hakgyoansim Dunggeunmiso OTF 400/700을 앱에 임베딩한다.
- `styled-components/native`의 `ThemeProvider`에 `tokens`를 주입하고 공통 UI는 theme 기반 프리미티브로 작성한다.

## Consequences

화면 구현은 Figma 원시 색상을 직접 쓰기보다 semantic token을 우선 사용한다. 새로운 Figma 색상이 발견되면 primitive token에 추가한 뒤 semantic 의미가 있는 경우에만 semantic token으로 승격한다. 미관측 shade가 필요해지면 먼저 Figma 토큰 또는 디자인 결정을 확인한다.
