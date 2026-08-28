const appJson = require('./app.json');

const naverMapClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim();

const naverMapPlugin = naverMapClientId
  ? [
      [
        '@mj-studio/react-native-naver-map',
        {
          client_id: naverMapClientId,
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
