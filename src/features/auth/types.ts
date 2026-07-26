export interface User {
  id: number;
  provider?: SocialProvider;
  email?: string;
  name?: string;
  nickname?: string;
  profileImageUrl?: string;
}

export type SocialProvider = 'GOOGLE' | 'KAKAO';

export interface SocialLoginRequest {
  provider: SocialProvider;
  providerToken: string;
  deviceId: string;
}

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  userId: number;
  provider: SocialProvider;
}
