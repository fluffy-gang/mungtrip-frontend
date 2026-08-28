# 멍멍트립 Play 심사 최소 버전 Architecture

## 현재 구조

앱은 Expo SDK 57, React Native 0.86, Expo Router와 네이버 지도 네이티브 SDK를 사용한다. `src/app`의 얇은 route가 `src/features/home`과 `src/features/places` 화면을 조합하고, `src/shared/api`의 Axios 클라이언트가 멍멍트립 API를 호출한다.

현재 홈에는 장소 탐색 외에도 인증 초기화, 반려견 선택, 추천 코스, 현재 위치, 미완성 하단 탭과 준비 중인 상세 화면이 연결되어 있다. 앱 설정에는 SecureStore와 위치 모듈 및 Android 위치 권한이 포함되어 있다.

## 목표 구조

```text
Expo Router
├─ 홈: 제주 지도 + 결과 수 + 카테고리/태그 + 장소 목록
├─ 검색: 익명 키워드 검색
├─ 상세: 장소 이용 조건과 연락 정보
└─ 앱 정보: 데이터 출처 + 개인정보처리방침 링크
       │
       ├─ 멍멍트립 API → 한국관광공사 기반 장소 데이터
       └─ NAVER Maps SDK → 지도 타일과 마커
```

## Component 책임

- `src/app`: 홈과 장소 상세 route만 노출하고 Expo Router 탐색을 구성한다.
- `src/features/home`: 제주 지도, 카테고리·태그·익명 검색, 확정/임시 bounds, 장소 목록과 선택 상태를 관리한다.
- `src/features/places`: 목록/상세 응답을 정규화하고 상세 화면의 표시 규칙을 소유한다.
- `src/shared/api`: 공개 API URL을 사용해 타임아웃과 표준 오류를 처리한다.
- `src/shared/config`: 클라이언트에 공개 가능한 환경 설정만 노출한다.
- 앱 정보 UI: 데이터 출처, 정보 정확성 안내, 개인정보처리방침 링크를 제공한다.

## 데이터 흐름

1. 앱은 고정된 제주 bounds로 카테고리, 태그와 장소 목록을 익명 요청한다.
2. API 서버는 한국관광공사 기반 장소 데이터를 앱 표시 타입으로 반환한다.
3. 앱은 좌표가 있는 장소만 지도 마커로 표시하고 전체 유효 응답을 목록에 표시하며, 응답 배열 길이를 현재 결과 수로 사용한다.
4. 탐색 상태는 `keyword`, 단일 `category`, 단일 `tag`, `committedBounds`, `draftBounds`, `results`, `selectedPlaceId`를 구분한다.
5. 지도 이동은 `draftBounds`만 갱신하고, “이 지역 검색”을 누를 때 현재 조건과 함께 `committedBounds`로 확정한다. 키워드·카테고리·태그 변경은 마지막 `committedBounds`에 결합한다.
6. 각 목록 요청은 취소하거나 요청 순서를 판별해 최신 요청의 성공·오류만 결과 상태에 반영한다.
7. 검색어는 요청 시에만 서버로 전송하고 앱과 서버에 영구 저장하지 않는다.
8. 장소 선택 시 ID로 상세를 요청하고 존재하는 필드를 방문 판단 순서로 렌더링한다.
9. 네이버 지도 SDK는 지도 렌더링에만 사용하며 사용자 위치를 전달하지 않는다.

## 탐색 상태 불변식

- 지도와 목록은 같은 `results`와 `selectedPlaceId`를 사용하고, 마커용 좌표 필터링은 목록 결과 자체를 변경하지 않는다.
- 결과 수는 현재 응답에서 유효하게 매핑된 `results.length`이며 서버 전체 개수나 제주 전체 개수와 동일하다고 간주하지 않는다.
- 카테고리와 태그는 각각 최대 하나만 선택하며, 선택한 태그는 기존 `tags` query에 단일 원소 배열로 전달한다.
- “조건 초기화”는 keyword/category/tag만 초기화하고 `committedBounds`를 유지한다. 전체 영역 복귀는 사용자가 지도를 직접 이동한 뒤 “이 지역 검색”으로 확정한다.
- 상세 화면에서 돌아오면 탐색 조건, 결과, 선택과 목록 스크롤 맥락을 유지한다. 새 앱 실행과 명시적 초기화에서만 해당 범위를 초기화한다.

## 시스템 경계

- 멍멍트립 API: 장소 데이터와 검색 결과를 제공하는 외부 운영 경계다.
- API gateway/CDN/load balancer: TLS 종료, rate limit과 비식별 운영 지표를 담당하는 인프라 경계다.
- 한국관광공사 데이터: 장소 정보의 기준 데이터이며 앱에서 출처를 표시한다.
- NAVER Maps SDK: 지도 타일과 지도 조작을 제공하는 제3자 네이티브 경계다.
- 외부 이미지와 홈페이지: 장소 이미지 로딩 및 사용자의 명시적 외부 이동이 발생하는 제3자 경계다.
- Google Play Console/EAS: Android 서명, AAB 빌드, 테스트 및 배포 경계다.
- 공식 웹 도메인: 개인정보처리방침과 운영자 연락처의 공개 경계다.

## 보안과 호환성

- 인증 기능과 SecureStore 접근을 앱 실행 경로에서 제거한다.
- `expo-location` 설정과 Android 위치 권한을 제거하고 네이버 지도 위치 추적을 사용하지 않는다.
- 분석, 광고, 사용자 식별 SDK를 포함하지 않는다.
- 앱과 API application log에는 IP, 검색어, 기기 식별자를 기록하지 않는다.
- gateway/CDN/load balancer access log는 저장 전에 IP를 비식별화하고 검색 query를 제거한다.
- 검색어는 검색 응답 생성에만 사용하고 응답 완료 후 폐기한다.
- 상태 코드, 응답 시간, 오류율과 같이 개인을 식별할 수 없는 운영 지표만 보관한다.
- OAuth secret, NAVER client secret, 공공데이터 서비스 키는 앱 번들과 `EXPO_PUBLIC_*` 환경변수에 넣지 않는다.
- 공개 가능한 API URL과 NAVER Maps Client ID만 빌드 환경에 제공한다.
- production API는 HTTPS와 무인증 읽기 전용 endpoint만 앱에 노출하고, rate limit을 적용한다.
- 한국관광공사 서비스 키는 서버에서만 사용한다.
- NAVER Cloud Maps Application에 `com.mungtrip.app`을 등록하고 Mobile Dynamic Map, 쿼터, 결제 상태를 확인한다.
- Expo SDK 57 기본 Android target SDK 36과 `com.mungtrip.app` 패키지를 유지한다.
- 이후 완성 앱은 동일한 패키지명과 서명키를 사용하고 더 높은 `versionCode`로 업데이트한다.
- Data safety 선언 전 최종 AAB의 전체 SDK, 네트워크 대상, 모든 활성 Play 트랙과 운영 인프라 로그를 감사하며, 실제 처리와 다른 무수집 선언을 하지 않는다.

## 장애 경계

- 제출 직전 production API의 카테고리·목록·검색·대표 상세 요청을 수동 smoke test한다.
- 지도 인증 실패, 쿼터 초과 또는 네트워크 오류 시 지도 오류 상태를 표시하고 장소 목록과 상세는 계속 제공한다.
- 지도와 목록은 같은 장소 결과·필터·선택 상태를 사용하되, 목록 탐색과 상세 진입은 지도 SDK 생명주기에 의존하지 않는다.
- 지도 SDK 실패 시 `draftBounds` 갱신과 “이 지역 검색”만 사용할 수 없고, 마지막 `committedBounds`의 필터·검색·목록·상세는 계속 동작한다.
- API 오류 시 오류 안내와 재시도를 제공하며 장소 데이터를 앱 번들에 중복 저장하지 않는다.
- 핵심 조회 smoke test가 실패하면 심사 제출을 중단한다.
