import { Asset } from 'expo-asset';

import { hasBreedPreset } from './preset-rules';

import type { BreedInputMode } from './types';

const HERO = require('../../../assets/dog-presets/webp/강아지등록.webp');
const PRESETS: Record<string, { cover: number; profile: number }> = {
  'golden-retriever': { cover: require('../../../assets/dog-presets/webp/골든 리트리버.webp'), profile: require('../../../assets/dog-presets/webp/골든 리트리버-1.webp') },
  greyhound: { cover: require('../../../assets/dog-presets/webp/그레이하운드.webp'), profile: require('../../../assets/dog-presets/webp/그레이하운드-1.webp') },
  maltese: { cover: require('../../../assets/dog-presets/webp/말티즈.webp'), profile: require('../../../assets/dog-presets/webp/말티즈-1.webp') },
  'border-collie': { cover: require('../../../assets/dog-presets/webp/보더콜리.webp'), profile: require('../../../assets/dog-presets/webp/보더콜리-1.webp') },
  bichon: { cover: require('../../../assets/dog-presets/webp/비숑.webp'), profile: require('../../../assets/dog-presets/webp/비숑-1.webp') },
  'mixed-breed': { cover: require('../../../assets/dog-presets/webp/시고르자브종.webp'), profile: require('../../../assets/dog-presets/webp/시고르자브종-1.webp') },
  shiba: { cover: require('../../../assets/dog-presets/webp/시바견.webp'), profile: require('../../../assets/dog-presets/webp/시바견-1.webp') },
  'welsh-corgi': { cover: require('../../../assets/dog-presets/webp/웰시코기.webp'), profile: require('../../../assets/dog-presets/webp/웰시코기-1.webp') },
  jindo: { cover: require('../../../assets/dog-presets/webp/진돗개.webp'), profile: require('../../../assets/dog-presets/webp/진돗개-1.webp') },
  chihuahua: { cover: require('../../../assets/dog-presets/webp/치와와.webp'), profile: require('../../../assets/dog-presets/webp/치와와-1.webp') },
  pomeranian: { cover: require('../../../assets/dog-presets/webp/포메라니안.webp'), profile: require('../../../assets/dog-presets/webp/포메라니안-1.webp') },
  poodle: { cover: require('../../../assets/dog-presets/webp/푸들.webp'), profile: require('../../../assets/dog-presets/webp/푸들-1.webp') },
};

export function getHeroPreset() { return HERO; }

export function isRenderableImageUri(value: string | undefined) {
  // TODO(#25): use the verified permanent CDN resolver once the server contract exists.
  return Boolean(value && /^(?:https?|file|data):/i.test(value));
}

export function getBreedPreset(breedId: string | undefined, mode: BreedInputMode) {
  return mode === 'selected' && hasBreedPreset(breedId) && breedId ? PRESETS[breedId] : undefined;
}

export async function getLocalAssetUri(module: number) {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error('프리셋 이미지를 준비하지 못했어요.');
  return asset.localUri;
}
