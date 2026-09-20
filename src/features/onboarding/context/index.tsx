import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { getAuthSession } from '@/features/auth/storage';
import {
  createDog,
  fromWireSize,
  getDogs,
  getPersonalities,
  getUserAgreements,
  updateDog,
  uploadDogProfile,
} from '../api';
import { createEmptyDraft } from '../constants';
import { getLocalAssetUri, getBreedPreset } from '../preset-assets';
import { submitDogDraft } from '../dog-submission';
import { createDraftSubmissionState, resetDraftSubmission } from '../submission-state';
import { getProviderToken } from '../social';
import {
  getDeviceId,
  getDogRegistrationSkipped,
  setDogRegistrationSkipped,
} from '../storage';

import type { OnboardingContextValue, OnboardingProviderProps } from './type';
import type { AuthSession } from '@/features/auth/types';
import type {
  BootstrapStatus,
  Dog,
  LoginProvider,
  OnboardingDraft,
  Personality,
} from '../types';

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { handleRestoreAccount, handleSocialLogin, initAuth } = useAuth();
  const [status, setStatus] = useState<BootstrapStatus>('initializing');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [draft, setDraftState] = useState(createEmptyDraft);
  const submission = useRef(createDraftSubmissionState());

  const resolveStatus = useCallback(async (nextSession: AuthSession) => {
    const agreement = await getUserAgreements();
    if (!agreement.allRequiredAgreed) {
      setStatus('agreements');
      return 'agreements' as const;
    }

    const nextDogs = await getDogs();
    setDogs(nextDogs);
    const skipped = await getDogRegistrationSkipped(nextSession.userId);
    const nextStatus = nextDogs.length > 0 || skipped ? 'ready' : 'dogPrompt';
    setStatus(nextStatus);
    return nextStatus;
  }, []);

  const bootstrap = useCallback(async () => {
    setStatus('initializing');
    const stored = await initAuth();
    if (!stored) {
      setSession(null);
      setStatus('anonymous');
      return 'anonymous' as const;
    }

    setSession(stored);
    try {
      return await resolveStatus(stored);
    } catch {
      const retainedSession = await getAuthSession();
      if (!retainedSession) {
        setSession(null);
        setStatus('anonymous');
        return 'anonymous' as const;
      }
      setStatus('bootstrapError');
      return 'bootstrapError' as const;
    }
  }, [initAuth, resolveStatus]);

  const login = useCallback(
    async (provider: LoginProvider, restoreToken?: string, suppliedToken?: string) => {
      const providerToken = suppliedToken ?? await getProviderToken(provider);
      const deviceId = await getDeviceId();
      const body = { deviceId, provider, providerToken };
      const response = restoreToken
        ? await handleRestoreAccount(restoreToken, body)
        : await handleSocialLogin(body);
      const nextSession: AuthSession = {
        accessToken: response.accessToken,
        provider: response.provider,
        refreshToken: response.refreshToken,
        userId: response.userId,
      };
      setSession(nextSession);
      try {
        return await resolveStatus(nextSession);
      } catch (error) {
        setStatus('bootstrapError');
        throw error;
      }
    },
    [handleRestoreAccount, handleSocialLogin, resolveStatus],
  );

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState(createEmptyDraft());
    resetDraftSubmission(submission.current);
  }, []);

  const loadDogs = useCallback(async () => {
    const next = await getDogs();
    setDogs(next);
    return next;
  }, []);

  const loadPersonalities = useCallback(async () => {
    setPersonalities([]);
    try {
      const next = await getPersonalities();
      setPersonalities(next);
      return next;
    } catch {
      return [];
    }
  }, []);

  const startEdit = useCallback((dog: Dog) => {
    resetDraftSubmission(submission.current, dog.dogId);
    setDraftState({
      breed: dog.breed ?? '',
      breedId: undefined,
      breedInputMode: 'manual',
      dogId: dog.dogId,
      isDangerousDog: dog.isDangerousDog ?? false,
      isNeutered: dog.isNeutered,
      name: dog.name ?? '',
      personalities: dog.personalities.map((item) => item.id),
      profileImageUrl: dog.profileImageUrl ?? '',
      size: fromWireSize(dog.size),
      weight: dog.weight == null ? '' : String(dog.weight),
    });
  }, []);

  const submitDog = useCallback(async (overrides?: Partial<OnboardingDraft>) => {
    return submitDogDraft(submission.current, draft, overrides, {
      createDog,
      getLocalAssetUri,
      getPresetProfile: (breedId, mode) => getBreedPreset(breedId, mode)?.profile,
      loadDogs,
      setSkipped: () => session ? setDogRegistrationSkipped(session.userId, false) : Promise.resolve(),
      updateDog,
      uploadDogProfile,
    });
  }, [draft, loadDogs, session]);

  const skipDogRegistration = useCallback(async () => {
    if (session) await setDogRegistrationSkipped(session.userId, true);
    setStatus('ready');
  }, [session]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      bootstrap,
      completeAgreements: () => setStatus('dogPrompt'),
      completeOnboarding: () => setStatus('ready'),
      dogs,
      draft,
      loadDogs,
      loadPersonalities,
      login,
      personalities,
      resetDraft,
      session,
      setDraft,
      skipDogRegistration,
      startEdit,
      status,
      submitDog,
    }),
    [bootstrap, dogs, draft, loadDogs, loadPersonalities, login, personalities, resetDraft, session, setDraft, skipDogRegistration, startEdit, status, submitDog],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('OnboardingProvider 안에서 사용해야 합니다.');
  return value;
}
