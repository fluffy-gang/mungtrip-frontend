const baseConfig = require('./app.json');

function getGoogleIosScheme(clientId) {
  if (!clientId?.endsWith('.apps.googleusercontent.com')) return undefined;

  return `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}`;
}

module.exports = () => {
  const expo = baseConfig.expo;
  const kakaoNativeAppKey = process.env.OAUTH_KAKAO_ANDROID_KEY;
  const kakaoJavascriptKey = process.env.OAUTH_KAKAO_JAVSCRIPT_KEY;
  const kakaoRestApiKey = process.env.OAUTH_KAKAO_API_KEY;
  const googleAndroidClientId = process.env.OAUTH_GOOGLE_ANDROID_CLIENT_ID;
  const googleIosClientId = process.env.OAUTH_GOOGLE_IOS_CLIENT_ID;
  const googleWebClientId = process.env.OAUTH_GOOGLE_WEB_CLIENT_ID;
  const googleIosScheme = getGoogleIosScheme(googleIosClientId);
  const plugins = expo.plugins.filter(
    (plugin) =>
      plugin !== 'expo-build-properties' &&
      plugin !== 'expo-image-picker' &&
      plugin !== 'expo-location' &&
      plugin !== '@react-native-google-signin/google-signin' &&
      plugin !== '@react-native-seoul/kakao-login',
  );

  plugins.push([
    'expo-image-picker',
    {
      photosPermission: '반려견 프로필 사진을 등록하려면 사진 접근 권한이 필요해요.',
      cameraPermission: false,
      microphonePermission: false,
    },
  ]);
  plugins.push([
    'expo-location',
    {
      locationWhenInUsePermission: '반려견과 함께 갈 수 있는 장소를 찾기 위해 위치 권한이 필요해요.',
    },
  ]);

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

  plugins.push([
    'expo-build-properties',
    {
      android: {
        extraMavenRepos: [
          'https://devrepo.kakao.com/nexus/content/groups/public/',
        ],
        kotlinVersion: '2.1.20',
      },
    },
  ]);

  return {
    ...expo,
    extra: {
      ...expo.extra,
      oauth: {
        googleAndroidClientId,
        googleIosClientId,
        googleWebClientId,
        kakaoJavascriptKey,
        kakaoRestApiKey,
      },
    },
    plugins,
  };
};
