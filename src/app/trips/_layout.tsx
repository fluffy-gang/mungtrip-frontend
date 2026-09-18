import { Stack } from 'expo-router';

import { TripSessionBoundary } from '@/features/trips/context';

export default function TripLayout() {
  return <TripSessionBoundary><Stack screenOptions={{ headerShown: false }} /></TripSessionBoundary>;
}
