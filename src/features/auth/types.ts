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

export interface LogoutRequest {
  deviceId: string;
}

export interface SocialLoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  isNewUser: boolean;
  pendingDeletion: boolean;
  userId: number;
  provider: SocialProvider;
  restoreToken: string | null;
}

export type AuthenticatedSocialLoginResponse = SocialLoginResponse & {
  accessToken: string;
  refreshToken: string;
  pendingDeletion: false;
};

export interface AuthSession {
  accessToken: string;
  provider: SocialProvider;
  refreshToken: string;
  userId: number;
}

export interface ReissueResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface RestoreAccountResponse {
  userId: number;
}

export interface UpdateMyProfileRequest {
  nickname: string;
}
