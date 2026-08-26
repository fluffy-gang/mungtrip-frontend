# 멍멍로드 Play 심사 최소 버전 Design

## 동작

홈은 제주 기본 영역의 네이버 지도와 카테고리 칩, 장소 목록으로 시작한다. 현재 위치 버튼과 반려견 선택기는 노출하지 않는다. 지도 마커와 목록 행은 동일한 장소 상세로 이동한다.

검색 화면은 키워드를 입력받아 익명 장소 검색을 실행한다. 최근 검색어는 영구 저장하지 않으며 앱 세션 내 표시도 최소 버전에서는 생략한다. 빈 검색어는 요청하지 않는다.

상세 화면은 장소명, 카테고리, 주소, 이미지, 동반 조건, 태그, 영업시간, 전화번호, 홈페이지, 최근 확인일을 응답에 존재할 때만 표시한다. 평점, 유저 인증 수, 찜, 내 여행 추가처럼 출처나 후속 동작이 필요한 정보는 표시하지 않는다. 하단에는 데이터 출처와 방문 전 확인 안내를 제공한다.

앱 정보 진입점은 홈에서 접근 가능해야 하며 개인정보처리방침을 공식 도메인의 공개 HTML로 연다.

## 변경 영역

- `src/features/home`: 인증·개인화·현재 위치·추천 코스·미완성 탭을 제거하고 지도/목록/검색 흐름을 완결한다.
- `src/features/places`: 실제 상세 API를 연결하고 유용한 장소 정보, 오류 및 빈 필드 표시를 구현한다.
- 앱 및 EAS 설정: 앱 이름, Android versionCode, production AAB 프로필을 설정하고 위치·SecureStore 관련 플러그인과 공개되면 안 되는 환경 설정을 제거한다.

## Interface와 Type

- 공개 서버 API 경로는 기존 `GET /api/v1/categories`, `GET /api/v1/tags`, `GET /api/v1/places`, `GET /api/v1/places/{id}`를 유지한다.
- 목록 요청은 제주 bounds, 선택한 category, 선택적 keyword, page/size만 사용한다.
- `Place` 표시 모델은 기존 응답 호환성을 유지하되 심사용 UI가 사용하지 않는 인증·좋아요·평점 필드는 렌더링하지 않는다.
- 상세 화면은 route parameter `id`를 양의 정수로 검증한 뒤 API를 호출한다.
- 개인정보처리방침 URL과 데이터 출처명은 플랫폼 안전 정적 설정으로 관리한다.

## 상태와 오류 처리

- 초기 목록: activity indicator를 표시하고 완료 후 목록으로 전환한다.
- 빈 목록/검색: 조건에 맞는 장소가 없다는 메시지와 필터 초기화 동작을 제공한다.
- 목록 오류: 네트워크 안내와 동일 요청 재시도 버튼을 제공한다.
- 상세 로딩: 이전 장소 내용을 재사용하지 않고 독립 로딩 상태를 표시한다.
- 잘못된 상세 ID/404: 장소를 찾을 수 없다는 안내와 뒤로가기 동작을 제공한다.
- 상세 네트워크 오류: 재시도와 뒤로가기를 모두 제공한다.
- 이미지 오류: 레이아웃을 유지하는 기본 장소 이미지를 표시한다.
- 지도 초기화 실패: 장소 목록은 계속 사용할 수 있고 지도 영역에 간결한 오류 안내를 표시한다.
- 전화/홈페이지 링크 실패: 앱이 종료되지 않으며 열 수 없다는 안내를 표시한다.

## Play Console 설정

- 기본 언어와 배포 국가는 한국어와 대한민국으로 설정한다.
- 앱은 무료, 카테고리는 여행 및 지역정보로 설정한다.
- 대상 연령은 18세 이상이고 어린이 대상 앱이 아니라고 선언한다.
- 광고 없음, 앱 접근 제한 없음, 로그인 정보 불필요로 선언한다.
- 개발자 신원, 이메일, 전화번호와 Android 실기기 검증을 완료한다.
- Data safety, 개인정보처리방침, content rating과 Play Console에 표시되는 모든 관련 앱 콘텐츠 선언을 완료한다.
- 지원 이메일과 공식 웹사이트를 등록한다.
- Play 아이콘, feature graphic과 제출 AAB의 실제 화면으로 만든 휴대전화 스크린샷 2장 이상을 등록한다.
- 스토어 설명과 그래픽에는 검증·추천·동선 설계처럼 이번 버전에 없는 기능을 포함하지 않는다.

## 개인정보처리방침과 Data safety

- 개인정보처리방침은 공식 도메인의 공개·비로그인·비편집 정적 HTML로 제공한다.
- 앱과 Play Console은 동일한 개인정보처리방침 URL을 사용한다.
- 방침에는 앱과 운영 주체명, 문의처, 처리 데이터, 제3자 서비스, 보안 조치, 보관·삭제 원칙을 포함한다.
- 최종 AAB의 SDK·권한·네트워크 요청, 모든 활성 Play 트랙과 운영 인프라 로그를 표로 대조한 뒤 Data safety를 확정한다.
- IP 기반 위치 추정이나 SDK의 외부 전송을 확인하면 무수집으로 신고하지 않고 실제 처리 내용을 반영한다.

## 빌드와 아티팩트 승격

- EAS `appVersionSource`는 `remote`, production profile의 `autoIncrement`는 `true`로 설정한다.
- Play App Signing을 활성화하고 EAS upload key 관리 책임자를 지정한다.
- 내부 테스트를 통과한 동일 AAB를 비공개 테스트로 승격한다.
- 코드나 빌드 설정이 변경되면 새 `versionCode`로 AAB를 생성하고 전체 release 검증을 반복한다.
- 각 제출 아티팩트에 git SHA, EAS build ID, versionName, versionCode와 production 환경 이름을 기록한다.

## 비공개 테스트 Runbook

1. 목표 사용자와 유사하고 기기/OS가 분산된 테스터 15명 이상을 모집한다.
2. 모든 테스터에게 연속 14일 opt-in 유지와 테스트 피드백 제출 방법을 안내한다.
3. 지도 이동·마커 선택, 카테고리 필터, 키워드 검색, 장소 상세, 전화·홈페이지 연결 시나리오를 제공한다.
4. 테스터별 기기/OS, 수행 기능, 피드백과 발견 이슈를 테스트 대장에 기록한다.
5. Google Play Testing feedback을 기본 채널로 사용하고 피드백을 정기적으로 분류한다.
6. critical/high 결함은 수정 AAB로 재검증하고 해결 전 프로덕션 접근을 신청하지 않는다.
7. 12명 이상이 14일 연속 참여하고 핵심 기능 사용 기록이 확인되면 피드백과 변경 내용을 요약한다.
8. 테스터 참여 방식, 실제 사용과 차이, 피드백, 반영 변경, production readiness 답변을 검토한 뒤 신청한다.

## 구현 순서

1. 전용 feature 이슈를 만들고 깨끗한 `origin/develop` 기준 별도 작업 디렉터리에서 `release/play-review-mvp-#<issue>`를 분기한다.
2. 앱 시작 경로에서 인증 초기화를 제거하고 로그인·반려견 개인화 의존성을 끊는다.
3. 현재 위치 UI와 로직, `expo-location`, 위치 권한 및 네이버 지도 위치 옵션을 제거한다.
4. 홈을 지도·카테고리·장소 목록·검색만 남도록 축소하고 무반응/준비 중 기능을 제거한다.
5. 기존 상세 API를 연결해 장소 상세의 로딩·성공·빈 값·오류 상태를 구현한다.
6. 앱 정보, 데이터 출처, 정확성 안내와 개인정보처리방침 링크를 추가한다.
7. 앱 이름 `멍멍로드`, package `com.mungtrip.app`, version `1.0.0`과 EAS remote versionCode 및 production AAB 설정을 확정한다.
8. 공식 도메인에 정적 개인정보처리방침을 게시하고 앱과 Play Console에 같은 URL을 연결한다.
9. 최종 번들 권한·SDK·환경변수와 서버 로그 정책을 감사한 뒤 Data safety를 작성한다.
10. 내부 테스트를 통과한 AAB를 비공개 테스트에 배포하고 12명 이상이 14일 연속 참여하도록 운영한다.

## 검증

- `pnpm check:todos`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm exec expo-doctor`
- `pnpm exec expo export --platform android`
- 장소 mapper의 누락값과 잘못된 타입을 자동화 테스트로 검증한다.
- 상세 route ID의 정상·잘못된·누락 입력을 자동화 테스트로 검증한다.
- 검색어 trim, 빈 검색 방지와 카테고리/bounds 요청을 자동화 테스트로 검증한다.
- 목록·상세의 loading, empty, 404, 5xx와 retry 상태를 자동화 테스트로 검증한다.
- resolved Expo config에서 앱 이름, package, versionCode와 Android 권한을 확인한다.
- 최종 AAB 또는 생성된 manifest에서 위치, 카메라, 마이크, 연락처 권한이 없음을 확인한다.
- Android 7 및 Android 16 휴대전화와 지원 대상 태블릿에서 콜드 스타트, 지도, 필터, 검색, 상세, 뒤로가기, 외부 링크를 수동 검증한다.
- TalkBack, 글자 확대, 접근성 label과 터치 영역을 수동 검증한다.
- EAS 개발 빌드가 아니라 Play 내부 테스트에서 전달된 release APK로 최종 검증한다.
- 오프라인, 지연 응답, 4xx/5xx, 빈 결과, 이미지 누락, 지도 인증 실패를 수동 검증한다.
- Play 내부 테스트와 pre-launch report에서 crash/ANR 및 핵심 탐색 실패가 없음을 확인한다.
- 스토어 설명과 스크린샷이 제출 AAB의 실제 기능만 나타내는지 대조한다.

## 제외 사항

- 심사용 축소 변경을 기존 개발 브랜치로 역병합하지 않는다.
- 문서 단계에서 브랜치, 커밋, 빌드 또는 Play Console 변경을 수행하지 않는다.
- 심사용 브랜치에는 비공개 테스트를 막는 결함 외의 완성 앱 기능을 추가하지 않는다.
- 추천 품질, 사용자 검증 계층과 여행 동선 설계는 후속 완성 앱에서 구현한다.

## 정책 기준

- Google Play 신규 개인 계정 테스트 요건: https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play 기능 및 사용자 경험 정책: https://support.google.com/googleplay/android-developer/answer/9898783
- Google Play 기기 검증: https://support.google.com/googleplay/android-developer/answer/14316361
- NAVER Maps Android SDK 시작 가이드: https://navermaps.github.io/android-map-sdk/guide-ko/1.html
- 기준 확인일: 2026-08-26
