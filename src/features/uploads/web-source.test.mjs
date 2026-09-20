import assert from 'node:assert/strict';
import test from 'node:test';

import { readWebBlob } from './web-source.ts';

test('reads browser picker blob and preset asset URIs into uploadable blobs', async () => {
  const blob = new Blob(['image bytes'], { type: 'image/webp' });
  const requested = [];
  const fetchSource = async uri => {
    requested.push(uri);
    return new Response(blob);
  };
  const pickerBlob = await readWebBlob('blob:picker-image', fetchSource);
  const presetAsset = await readWebBlob('/assets/dog.webp', fetchSource);

  assert.deepEqual(requested, ['blob:picker-image', '/assets/dog.webp']);
  for (const result of [pickerBlob, presetAsset]) {
    assert.equal(result.type, 'image/webp');
    assert.equal(await result.text(), 'image bytes');
  }
});
