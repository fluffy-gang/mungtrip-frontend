import { getUploadSource } from '@/features/uploads/types';

import type { UploadFileSource } from '@/features/uploads/types';
import type { DogSaveRequest, OnboardingDraft } from './types';

export interface DraftSubmissionState {
  generation: number;
  confirmedDogId?: number;
  uploadKeys: Map<string, string>;
  inFlight?: Promise<number>;
}

export function createDraftSubmissionState(): DraftSubmissionState { return { generation: 0, uploadKeys: new Map() }; }
export function resetDraftSubmission(state: DraftSubmissionState, dogId?: number) { state.generation += 1; state.confirmedDogId = dogId; state.uploadKeys.clear(); state.inFlight = undefined; }
export function getConfirmedDogId(state: DraftSubmissionState, draftDogId?: number) { return state.confirmedDogId ?? draftDogId; }
export function confirmDogSave(state: DraftSubmissionState, dogId: number) { state.confirmedDogId = dogId; }
export function runDraftSubmission(state: DraftSubmissionState, operation: (generation: number) => Promise<number>) {
  if (state.inFlight) return state.inFlight;
  const generation = state.generation;
  state.inFlight = operation(generation).finally(() => {
    if (state.generation === generation) state.inFlight = undefined;
  });
  return state.inFlight;
}

interface SubmissionResponse { dogId: number }

export interface DogSubmissionDependencies {
  createDog: (payload: DogSaveRequest) => Promise<SubmissionResponse>;
  getLocalAssetUri: (module: number) => Promise<string>;
  getPresetProfile: (breedId: string | undefined, mode: OnboardingDraft['breedInputMode']) => number | undefined;
  loadDogs: () => Promise<unknown>;
  setSkipped: () => Promise<void>;
  updateDog: (dogId: number, payload: DogSaveRequest) => Promise<SubmissionResponse>;
  uploadDogProfile: (source: UploadFileSource, fileType: string) => Promise<string>;
}

export function submitDogDraft(
  state: DraftSubmissionState,
  draft: OnboardingDraft,
  overrides: Partial<OnboardingDraft> | undefined,
  dependencies: DogSubmissionDependencies,
) {
  const submittedDraft = { ...draft, ...overrides };
  return runDraftSubmission(state, async (generation) => {
    const ensureCurrent = () => {
      if (state.generation !== generation) throw new Error('등록 상태가 변경되어 저장을 취소했어요.');
    };
    let profileImageUrl = submittedDraft.profileImageUrl;
    if (submittedDraft.profileImage?.uri) {
      const mimeType = submittedDraft.profileImage.mimeType ?? 'image/jpeg';
      const cacheKey = `${submittedDraft.profileImage.uri}:${mimeType}`;
      profileImageUrl = state.uploadKeys.get(cacheKey) ?? '';
      if (!profileImageUrl) {
        profileImageUrl = await dependencies.uploadDogProfile(
          getUploadSource(submittedDraft.profileImage.uri, submittedDraft.profileImage.file),
          mimeType,
        );
        ensureCurrent();
        state.uploadKeys.set(cacheKey, profileImageUrl);
      }
    } else if (!profileImageUrl) {
      const presetProfile = dependencies.getPresetProfile(submittedDraft.breedId, submittedDraft.breedInputMode);
      if (presetProfile != null) {
        const cacheKey = `${submittedDraft.breedId}:${submittedDraft.breedInputMode}`;
        profileImageUrl = state.uploadKeys.get(cacheKey) ?? '';
        if (!profileImageUrl) {
          const uri = await dependencies.getLocalAssetUri(presetProfile);
          ensureCurrent();
          profileImageUrl = await dependencies.uploadDogProfile(uri, 'image/webp');
          ensureCurrent();
          state.uploadKeys.set(cacheKey, profileImageUrl);
        }
      }
    }
    const payload: DogSaveRequest = {
      breed: submittedDraft.breed.trim(),
      isDangerousDog: submittedDraft.isDangerousDog,
      isNeutered: submittedDraft.isNeutered,
      name: submittedDraft.name.trim(),
      personalityIds: submittedDraft.personalities,
      profileImageUrl,
      size: ({ LARGE: 'L', MEDIUM: 'M', SMALL: 'S' } as const)[submittedDraft.size],
      weight: submittedDraft.weight.trim() ? Number(submittedDraft.weight) : undefined,
    };
    const dogId = getConfirmedDogId(state, submittedDraft.dogId);
    const response = dogId
      ? await dependencies.updateDog(dogId, payload)
      : await dependencies.createDog(payload);
    ensureCurrent();
    confirmDogSave(state, response.dogId);
    await dependencies.setSkipped();
    ensureCurrent();
    await dependencies.loadDogs();
    ensureCurrent();
    return response.dogId;
  });
}
