const { rmSync } = require('node:fs');
const { resolve } = require('node:path');

// Keep cleanup project-scoped: global Gradle and Xcode caches may be shared by other apps.
const cachePaths = [
  '.expo',
  'node_modules/.cache',
  'android/.gradle',
  'android/build',
  'android/app/build',
  'ios/build',
  'dist',
  'web-build',
];

const projectRoot = resolve(__dirname, '..');

for (const cachePath of cachePaths) {
  rmSync(resolve(projectRoot, cachePath), { force: true, recursive: true });
  console.log(`Cleaned ${cachePath}`);
}

console.log('Project build caches cleaned. Use pnpm start:clean to also reset Metro.');
