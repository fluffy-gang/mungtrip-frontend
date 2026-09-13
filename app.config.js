const appJson = require('./app.json');

function getGoogleIosScheme(clientId) {
  if (!clientId?.endsWith('.apps.googleusercontent.com')) return undefined;

  return `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}`;
}

module.exports = ({ config }) => {
  const naverMapClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim();
  const kakaoNativeAppKey = process.env.OAUTH_KAKAO_ANDROID_KEY?.trim();
  const googleAndroidClientId = process.env.OAUTH_GOOGLE_ANDROID_CLIENT_ID?.trim();
  const googleIosClientId = process.env.OAUTH_GOOGLE_IOS_CLIENT_ID?.trim();
  const googleWebClientId = process.env.OAUTH_GOOGLE_WEB_CLIENT_ID?.trim();
  const googleIosScheme = getGoogleIosScheme(googleIosClientId);
  const locationPermission =
    '현재 위치를 기준으로 가까운 반려동물 동반 장소를 보여드릴게요.';
  const plugins = [...appJson.expo.plugins];
  const extraMavenRepos = [
    'https://repository.map.naver.com/archive/maven',
    'https://devrepo.kakao.com/nexus/content/groups/public/',
  ];

  plugins.push([
    'expo-build-properties',
    {
      android: {
        extraMavenRepos,
        kotlinVersion: '2.1.20',
      },
    },
  ]);

  if (naverMapClientId) {
    plugins.push([
      '@mj-studio/react-native-naver-map',
      {
        client_id: naverMapClientId,
        android: {
          ACCESS_FINE_LOCATION: true,
          ACCESS_COARSE_LOCATION: true,
        },
        ios: {
          NSLocationWhenInUseUsageDescription: locationPermission,
        },
      },
    ]);
  }

  if (kakaoNativeAppKey) {
    plugins.push([
      '@react-native-seoul/kakao-login',
      {
        kakaoAppKey: kakaoNativeAppKey,
        kotlinVersion: '2.1.20',
      },
    ]);
  }

  if (googleIosScheme) {
    plugins.push([
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: googleIosScheme },
    ]);
  }

  return {
    ...config,
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      oauth: {
        googleAndroidClientId,
        googleIosClientId,
        googleWebClientId,
      },
    },
    plugins,
  };
};
