import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'fade',
        gestureEnabled: false,
        headerShown: false,
      }}
    />
  );
}
