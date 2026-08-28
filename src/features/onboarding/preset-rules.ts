export const PRESET_BREED_IDS = [
  'golden-retriever', 'greyhound', 'maltese', 'border-collie', 'bichon',
  'mixed-breed', 'shiba', 'welsh-corgi', 'jindo', 'chihuahua', 'pomeranian', 'poodle',
] as const;

export function hasBreedPreset(breedId: string | undefined) {
  return breedId != null && PRESET_BREED_IDS.includes(breedId as (typeof PRESET_BREED_IDS)[number]);
}

export function selectProfileSource(input: {
  userPhotoUri?: string;
  savedImageValue?: string;
  presetSource?: number;
}) {
  if (input.userPhotoUri) return { kind: 'user' as const, source: input.userPhotoUri };
  if (input.savedImageValue) return { kind: 'saved' as const, source: input.savedImageValue };
  if (input.presetSource != null) return { kind: 'preset' as const, source: input.presetSource };
  return { kind: 'placeholder' as const };
}
