import { Redirect } from 'expo-router';

import type { Href } from 'expo-router';

export default function OnboardingIndexRoute() {
  return <Redirect href={'/onboarding/login' as Href} />;
}
