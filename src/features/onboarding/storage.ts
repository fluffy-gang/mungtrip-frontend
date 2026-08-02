import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthSession } from './types';

const SESSION_KEY = 'mungtrip.auth.session';
const DEVICE_ID_KEY = 'mungtrip.device.id';

async function getItem(key: string) {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredSession() {
  const value = await getItem(SESSION_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await deleteItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  return setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  return deleteItem(SESSION_KEY);
}

export async function getDeviceId() {
  const stored = await getItem(DEVICE_ID_KEY);
  if (stored) return stored;

  const created = Crypto.randomUUID();
  await setItem(DEVICE_ID_KEY, created);
  return created;
}

function skipKey(userId: number) {
  return `mungtrip.onboarding.dog-skipped.${userId}`;
}

export async function getDogRegistrationSkipped(userId: number) {
  return (await getItem(skipKey(userId))) === 'true';
}

export function setDogRegistrationSkipped(userId: number, skipped: boolean) {
  return skipped ? setItem(skipKey(userId), 'true') : deleteItem(skipKey(userId));
}
