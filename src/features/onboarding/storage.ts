import * as Crypto from 'expo-crypto';

import * as Storage from '@/shared/storage';

const DEVICE_ID_KEY = 'mungtrip.device.id';

export async function getDeviceId() {
  const stored = await Storage.getItem(DEVICE_ID_KEY);

  if (stored) return stored;

  const created = Crypto.randomUUID();
  await Storage.setItem(DEVICE_ID_KEY, created);

  return created;
}

function skipKey(userId: number) {
  return `mungtrip.onboarding.dog-skipped.${userId}`;
}

export async function getDogRegistrationSkipped(userId: number) {
  return (await Storage.getItem(skipKey(userId))) === 'true';
}

export function setDogRegistrationSkipped(userId: number, skipped: boolean) {
  return skipped
    ? Storage.setItem(skipKey(userId), 'true')
    : Storage.removeItem(skipKey(userId));
}
