import assert from 'node:assert/strict';
import test from 'node:test';

import { toMapBounds } from './map-utils.ts';

test('toMapBounds treats Region latitude and longitude as the viewport center', () => {
  assert.deepEqual(
    toMapBounds({ latitude: 33.5, longitude: 126.5, latitudeDelta: 0.2, longitudeDelta: 0.4 }),
    { swLng: 126.3, swLat: 33.4, neLng: 126.7, neLat: 33.6 },
  );
});
