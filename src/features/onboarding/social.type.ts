export interface OAuthExtra {
  googleAndroidClientId?: string;
  googleIosClientId?: string;
  googleWebClientId?: string;
  kakaoJavascriptKey?: string;
  kakaoRestApiKey?: string;
}

export interface OAuthPopupResult {
  code?: string;
  error?: string;
  errorDescription?: string;
  idToken?: string;
  state?: string;
}

export interface KakaoTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}
