const getApiUrl = (): string | undefined => {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();

  return value ? value.replace(/\/+$/, '') : undefined;
};

export const ENV = {
  apiUrl: getApiUrl(),
} as const;
