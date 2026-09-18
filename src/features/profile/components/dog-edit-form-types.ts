export type DogEditableField = 'name' | 'personality' | 'size' | null;

export type DogEditableFieldAction = Exclude<DogEditableField, null> | 'breed';

export const dogSizeOptions = [
  { label: '소형견 (~7kg)', value: 'S' },
  { label: '중형견 (7~25kg)', value: 'M' },
  { label: '대형견 (25kg~)', value: 'L' },
] as const;
