import { Asset } from 'expo-asset';

import { hasBreedPreset } from './preset-rules';

import type { BreedInputMode } from './types';

const HERO = require('../../../assets/dog-presets/webp/registration-hero.webp');
const PRESETS: Record<string, { cover: number; profile: number }> = {
  'golden-retriever': { cover: require('../../../assets/dog-presets/webp/golden-retriever-cover.webp'), profile: require('../../../assets/dog-presets/webp/golden-retriever-profile.webp') },
  greyhound: { cover: require('../../../assets/dog-presets/webp/greyhound-cover.webp'), profile: require('../../../assets/dog-presets/webp/greyhound-profile.webp') },
  maltese: { cover: require('../../../assets/dog-presets/webp/maltese-cover.webp'), profile: require('../../../assets/dog-presets/webp/maltese-profile.webp') },
  'border-collie': { cover: require('../../../assets/dog-presets/webp/border-collie-cover.webp'), profile: require('../../../assets/dog-presets/webp/border-collie-profile.webp') },
  bichon: { cover: require('../../../assets/dog-presets/webp/bichon-cover.webp'), profile: require('../../../assets/dog-presets/webp/bichon-profile.webp') },
  'mixed-breed': { cover: require('../../../assets/dog-presets/webp/mixed-breed-cover.webp'), profile: require('../../../assets/dog-presets/webp/mixed-breed-profile.webp') },
  shiba: { cover: require('../../../assets/dog-presets/webp/shiba-cover.webp'), profile: require('../../../assets/dog-presets/webp/shiba-profile.webp') },
  'welsh-corgi': { cover: require('../../../assets/dog-presets/webp/welsh-corgi-cover.webp'), profile: require('../../../assets/dog-presets/webp/welsh-corgi-profile.webp') },
  jindo: { cover: require('../../../assets/dog-presets/webp/jindo-cover.webp'), profile: require('../../../assets/dog-presets/webp/jindo-profile.webp') },
  chihuahua: { cover: require('../../../assets/dog-presets/webp/chihuahua-cover.webp'), profile: require('../../../assets/dog-presets/webp/chihuahua-profile.webp') },
  pomeranian: { cover: require('../../../assets/dog-presets/webp/pomeranian-cover.webp'), profile: require('../../../assets/dog-presets/webp/pomeranian-profile.webp') },
  poodle: { cover: require('../../../assets/dog-presets/webp/poodle-cover.webp'), profile: require('../../../assets/dog-presets/webp/poodle-profile.webp') },
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
