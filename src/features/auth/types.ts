export type User = {
  id: number;
  provider?: SocialProvider;
  email?: string;
  name?: string;
  nickname?: string;
  profileImageUrl?: string;
};

export type SocialProvider = 'GOOGLE' | 'KAKAO';

export type SocialLoginRequest = {
  provider: SocialProvider;
  providerToken: string;
  deviceId: string;
};

export type SocialLoginResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  userId: number;
  provider: SocialProvider;
};
