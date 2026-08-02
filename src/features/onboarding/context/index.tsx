import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  createDog,
  fromWireSize,
  getDogs,
  getPersonalities,
  getUserAgreements,
  socialLogin,
  toWireSize,
  updateDog,
  uploadDogProfile,
} from '../api';
import { createEmptyDraft } from '../constants';
import { getProviderToken } from '../social';
import {
  getDeviceId,
  getDogRegistrationSkipped,
  getStoredSession,
  saveSession,
  setDogRegistrationSkipped,
} from '../storage';

import type { OnboardingContextValue, OnboardingProviderProps } from './type';
import type {
  AuthSession,
  BootstrapStatus,
  Dog,
  LoginProvider,
  OnboardingDraft,
  Personality,
} from '../types';

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [status, setStatus] = useState<BootstrapStatus>('initializing');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [draft, setDraftState] = useState(createEmptyDraft);

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
    const stored = await getStoredSession();
    if (!stored) {
      setSession(null);
      setStatus('anonymous');
      return 'anonymous' as const;
    }

    setSession(stored);
    try {
      return await resolveStatus(stored);
    } catch {
      const retainedSession = await getStoredSession();
      if (!retainedSession) {
        setSession(null);
        setStatus('anonymous');
        return 'anonymous' as const;
      }
      setStatus('bootstrapError');
      return 'bootstrapError' as const;
    }
  }, [resolveStatus]);

  const login = useCallback(
    async (provider: LoginProvider) => {
      const providerToken = await getProviderToken(provider);
      const deviceId = await getDeviceId();
      const response = await socialLogin(provider, providerToken, deviceId);
      const nextSession: AuthSession = {
        accessToken: response.accessToken,
        provider: response.provider,
        refreshToken: response.refreshToken,
        userId: response.userId,
      };
      await saveSession(nextSession);
      setSession(nextSession);
      try {
        return await resolveStatus(nextSession);
      } catch (error) {
        setStatus('bootstrapError');
        throw error;
      }
    },
    [resolveStatus],
  );

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => setDraftState(createEmptyDraft()), []);

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
    const submittedDraft = { ...draft, ...overrides };
    let profileImageUrl = submittedDraft.profileImageUrl;
    if (submittedDraft.profileImage?.uri) {
      profileImageUrl = await uploadDogProfile(
        submittedDraft.profileImage.uri,
        submittedDraft.profileImage.mimeType ?? 'image/jpeg',
      );
    }
    const weight = submittedDraft.weight.trim() ? Number(submittedDraft.weight) : undefined;
    const payload = {
      breed: submittedDraft.breed.trim(),
      isDangerousDog: submittedDraft.isDangerousDog,
      isNeutered: submittedDraft.isNeutered,
      name: submittedDraft.name.trim(),
      personalityIds: submittedDraft.personalities,
      profileImageUrl,
      size: toWireSize(submittedDraft.size),
      weight,
    };
    const response = submittedDraft.dogId
      ? await updateDog(submittedDraft.dogId, payload)
      : await createDog(payload);
    if (session) await setDogRegistrationSkipped(session.userId, false);
    await loadDogs();
    return response.dogId;
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
