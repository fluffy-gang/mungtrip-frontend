import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'mungtrip.device.id';

export async function getDeviceId() {
  const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);

  if (stored) return stored;

  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, created);

  return created;
}

function skipKey(userId: number) {
  return `mungtrip.onboarding.dog-skipped.${userId}`;
}

export async function getDogRegistrationSkipped(userId: number) {
  return (await SecureStore.getItemAsync(skipKey(userId))) === 'true';
}

export function setDogRegistrationSkipped(userId: number, skipped: boolean) {
  return skipped
    ? SecureStore.setItemAsync(skipKey(userId), 'true')
    : SecureStore.deleteItemAsync(skipKey(userId));
}
