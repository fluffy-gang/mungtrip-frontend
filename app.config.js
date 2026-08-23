const appJson = require('./app.json');

const naverMapClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim();
const locationPermission =
  '현재 위치를 기준으로 가까운 반려동물 동반 장소를 보여드릴게요.';

const naverMapPlugin = naverMapClientId
  ? [
      [
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
      ],
    ]
  : [];

const nativeBuildPlugins = [
  [
    'expo-build-properties',
    {
      android: {
        extraMavenRepos: ['https://repository.map.naver.com/archive/maven'],
      },
    },
  ],
  ...naverMapPlugin,
];

module.exports = ({ config }) => ({
  ...config,
  ...appJson.expo,
  plugins: [...appJson.expo.plugins, ...nativeBuildPlugins],
});
