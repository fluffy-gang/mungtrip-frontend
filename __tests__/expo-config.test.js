const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

const FORBIDDEN_ANDROID_CAPABILITIES = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'expo-location',
  'expo-secure-store',
  'secure_store_backup_rules',
  'secure_store_data_extraction_rules',
];

const PUBLIC_ENV_NAMES = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_NAVER_MAP_CLIENT_ID',
];

it('exposes only approved public environment values in Expo config', () => {
  const configSources = ['app.config.js', 'src/shared/config/env.ts']
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  const referencedPublicEnvNames = [
    ...new Set(configSources.match(/EXPO_PUBLIC_[A-Z0-9_]+/g)),
  ].sort();

  expect(referencedPublicEnvNames).toEqual(PUBLIC_ENV_NAMES);

  const publicConfig = execFileSync(
    'pnpm',
    ['exec', 'expo', 'config', '--type', 'public', '--json'],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        EXPO_PUBLIC_API_URL: 'https://public-api.example.com',
        EXPO_PUBLIC_NAVER_MAP_CLIENT_ID: 'public-naver-client-id',
        EXPO_PUBLIC_API_SECRET: 'secret-must-not-be-public',
        NAVER_MAP_CLIENT_SECRET: 'secret-must-not-be-public',
      },
    },
  );

  expect(publicConfig).toContain('public-naver-client-id');
  expect(publicConfig).not.toContain('secret-must-not-be-public');
  expect(publicConfig).not.toMatch(
    /"[^"]*(?:credential|password|secret|token)[^"]*"\s*:/i,
  );

  for (const capability of FORBIDDEN_ANDROID_CAPABILITIES) {
    expect(publicConfig).not.toContain(capability);
  }
});
