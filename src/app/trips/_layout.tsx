import { Stack } from 'expo-router';

import { TripEnvironmentProvider } from '@/features/trips/context';
import { defaultTripProvider } from '@/features/trips/provider';
import { savedProvider } from '@/features/saved/provider';

export default function TripLayout() {
  return <TripEnvironmentProvider provider={defaultTripProvider} saved={savedProvider}><Stack screenOptions={{ headerShown: false }} /></TripEnvironmentProvider>;
}
