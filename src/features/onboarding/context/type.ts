import type { ReactNode } from 'react';
import type { AuthSession } from '@/features/auth/types';
import type {
  BootstrapStatus,
  Dog,
  LoginProvider,
  OnboardingDraft,
  Personality,
} from '../types';

export interface OnboardingProviderProps {
  children: ReactNode;
}

export interface OnboardingContextValue {
  bootstrap: () => Promise<BootstrapStatus>;
  completeAgreements: () => void;
  completeOnboarding: () => void;
  dogs: Dog[];
  draft: OnboardingDraft;
  loadDogs: () => Promise<Dog[]>;
  loadPersonalities: () => Promise<Personality[]>;
  login: (provider: LoginProvider, restoreToken?: string, providerToken?: string) => Promise<BootstrapStatus>;
  personalities: Personality[];
  resetDraft: () => void;
  session: AuthSession | null;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  skipDogRegistration: () => Promise<void>;
  startEdit: (dog: Dog) => void;
  status: BootstrapStatus;
  submitDog: (overrides?: Partial<OnboardingDraft>) => Promise<number>;
}
