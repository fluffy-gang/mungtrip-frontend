import assert from 'node:assert/strict';
import test from 'node:test';

import { getUploadSource } from './types.ts';

test('prefers a picker File/Blob and falls back to the URI for presets and native assets', () => {
  const file = new Blob(['photo'], { type: 'image/jpeg' });
  assert.equal(getUploadSource('blob:picker-photo', file), file);
  assert.equal(getUploadSource('file:///preset.webp'), 'file:///preset.webp');
});
