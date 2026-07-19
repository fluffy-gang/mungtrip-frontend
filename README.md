# mungtrip-frontend

## 현재 스택

- Expo SDK 57
- React Native 0.86
- TypeScript strict mode
- pnpm 9.6.0
- expo-router
- styled-components/native
- ESLint
- Development Build 예정
- TanStack Query 예정
- SecureStore 기반 인증 예정
- EAS Build 예정

## 빠른 시작

의존성 설치:

```bash
pnpm install
```

개발 서버 실행:

```bash
pnpm start
```

플랫폼별 실행:

```bash
pnpm ios
pnpm android
pnpm web
```

검증:

```bash
pnpm lint
pnpm typecheck
```

## 패키지 매니저 규칙

이 프로젝트는 pnpm을 사용합니다. npm 또는 yarn lockfile을 추가하지 않습니다.

`package.json`에서 pnpm 버전을 고정합니다.

```json
{
  "packageManager": "pnpm@9.6.0"
}
```

Expo/React Native 호환성을 위해 `.npmrc`에 hoisted node_modules 설정을 둡니다.

```ini
node-linker=hoisted
strict-peer-dependencies=false
```

## 현재 프로젝트 구조

라우팅은 `expo-router`를 사용하며, 앱 엔트리는 `src/app` 아래에 있습니다.

```txt
src/app/
  _layout.tsx
  index.tsx
```

공통 스타일은 `src/constants/tokens/`에 분리되어 있고, `src/constants/tokens/index.ts`가 공개 진입점입니다.
`styled-components/native`는 루트에서 `ThemeProvider`로 `tokens`를 주입하는 방식으로 사용합니다.

현재 주요 alias:

```txt
@/* -> ./src/*
@/assets/* -> ./assets/*
```

## 초기 셋업 진행 상황

### 1. 패키지 매니저 설정

- [x] pnpm 사용 결정
- [x] `package.json`에 package manager 고정
- [x] Expo/React Native 호환성을 위해 `.npmrc` 설정
- [x] `pnpm-lock.yaml` 생성
- [x] `.gitignore`에 pnpm store와 `node_modules` 제외

### 2. 프로젝트 생성

- [x] Expo 프로젝트 생성
- [x] TypeScript 설정 확인
- [ ] 기본 실행 확인

```bash
pnpm expo start
```

### 3. Development Build 설정

- [ ] `expo-dev-client` 설치

```bash
pnpm expo install expo-dev-client
```

- [ ] EAS CLI 준비

전역 설치보다 `pnpm dlx` 또는 dev dependency 사용을 우선합니다.

```bash
pnpm dlx eas-cli login
```

- [ ] EAS 프로젝트 설정

```bash
pnpm dlx eas-cli init
```

- [ ] `eas.json` 빌드 프로파일 구성

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

- [ ] iOS development build 생성

```bash
pnpm dlx eas-cli build --profile development --platform ios
```

- [ ] Android development build 생성

```bash
pnpm dlx eas-cli build --profile development --platform android
```

- [ ] dev client로 실행

```bash
pnpm expo start --dev-client
```

### 4. 라우팅 설정

- [x] `expo-router` 설치 및 설정
- [x] `src/app/` 기반 라우팅 구조 생성
- [x] 템플릿 기본 화면 구성
- [ ] 인증 전/후 라우팅 분리 방식 결정
  - 로그인 전: `login`, `signup`
  - 로그인 후: `(tabs)`, 상세 화면

### 5. 환경변수 구조

- [ ] 환경별 API URL 정의

```txt
.env.development
.env.preview
.env.production
```

예:

```env
EXPO_PUBLIC_API_URL=https://dev-api.example.com
```

- [ ] `app.config.ts`로 환경별 설정 관리
- [ ] 앱에 노출 가능한 값만 `EXPO_PUBLIC_` 사용
- [ ] 민감한 값은 앱에 포함하지 않기
- [ ] dev / preview / production 빌드에서 API endpoint가 다르게 들어가는지 확인

### 6. API 클라이언트 구조

- [ ] HTTP 클라이언트 선택
  - `axios` 또는 `fetch` wrapper

```bash
pnpm add axios
```

- [ ] API 기본 구조 생성

```txt
src/
  api/
    client.ts
    auth.ts
  queries/
    auth/
      useMeQuery.ts
      useLoginMutation.ts
```

- [ ] `client.ts`에서 baseURL 연결
- [ ] request interceptor에서 access token 주입
- [ ] response interceptor에서 401 처리 기준 정의
- [ ] API 에러 타입 표준화

예상 구조:

```ts
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});
```

### 7. React Query 설정

- [ ] TanStack Query 설치

```bash
pnpm add @tanstack/react-query
```

- [ ] `QueryClientProvider` 루트에 연결
- [ ] 기본 옵션 설정

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});
```

- [ ] 로그인/내 정보/로그아웃 query, mutation 기준 정리
- [ ] 로그아웃 시 query cache clear 처리

### 8. 인증 구조

- [ ] 토큰 저장소 결정
  - access token / refresh token: `expo-secure-store`

```bash
pnpm expo install expo-secure-store
```

- [ ] 인증 관련 파일 구조 생성

```txt
src/
  auth/
    tokenStorage.ts
    authSession.ts
    AuthProvider.tsx
```

- [ ] 앱 시작 시 refresh token 또는 저장된 세션 확인
- [ ] 로그인 성공 시 토큰 저장
- [ ] API 요청 시 access token 첨부
- [ ] 401 발생 시 refresh token으로 재발급
- [ ] refresh 실패 시 로그아웃 처리
- [ ] 로그아웃 시:
  - SecureStore token 삭제
  - React Query cache 초기화
  - 로그인 화면으로 이동

### 9. 폼/검증

- [ ] 로그인/회원가입 대비 폼 라이브러리 설치

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

- [ ] 공통 validation schema 위치 결정

```txt
src/
  schemas/
    auth.schema.ts
```

### 10. 저장소

- [ ] 민감 정보: `expo-secure-store`
- [ ] 일반 설정값: AsyncStorage

```bash
pnpm expo install @react-native-async-storage/async-storage
```

- [ ] 저장소 사용 기준 문서화
  - 토큰: SecureStore
  - 온보딩 완료 여부: AsyncStorage
  - 사용자 설정: AsyncStorage

### 11. 코드 품질 도구

- [x] ESLint 설정
- [ ] Prettier 설정
- [x] TypeScript strict mode 확인
- [x] path alias 설정
- [x] `lint`, `typecheck` script 추가

```json
{
  "scripts": {
    "lint": "expo lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### 12. 앱 설정

- [ ] `app.config.ts`로 전환
- [ ] 앱 이름, slug, scheme 설정
- [ ] iOS bundle identifier 설정
- [ ] Android package name 설정
- [ ] 앱 아이콘 설정
- [ ] splash 설정
- [ ] deep link scheme 설정

### 13. 최소 화면 구현

- [ ] Splash/loading 화면
- [ ] 로그인 화면
- [ ] 홈 화면
- [ ] 마이페이지 화면
- [ ] 인증 상태에 따라 화면 분기
- [ ] API 연결 테스트용 `/me` query 구현

### 14. 검증

- [ ] `pnpm expo start --dev-client` 실행 확인
- [ ] iOS development build에서 실행 확인
- [ ] Android development build에서 실행 확인
- [ ] 환경변수 dev/preview/prod 분기 확인
- [ ] 로그인 -> 토큰 저장 -> 앱 재시작 -> 세션 복구 확인
- [ ] 로그아웃 -> 토큰 삭제 -> query cache 초기화 확인
- [ ] 401/refresh 실패 케이스 확인
