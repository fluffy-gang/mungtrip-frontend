const getApiUrl = (): string => {
  const value = process.env.EXPO_PUBLIC_API_URL;

  if (!value) {
    throw new Error('EXPO_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
  }

  return value.replace(/\/+$/, '');
};

export const ENV = {
  apiUrl: getApiUrl(),
} as const;
