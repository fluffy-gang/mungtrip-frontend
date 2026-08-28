import assert from 'node:assert/strict';
import { PRESET_BREED_IDS, hasBreedPreset, selectProfileSource } from '../src/features/onboarding/preset-rules.ts';
import { getImageSourceIdentity } from '../src/features/onboarding/image-source-identity.ts';
import { confirmDogSave, createDraftSubmissionState, getConfirmedDogId, resetDraftSubmission, runDraftSubmission, submitDogDraft } from '../src/features/onboarding/dog-submission.ts';

assert.equal(PRESET_BREED_IDS.length, 12);
assert.equal(hasBreedPreset('bichon'), true);
assert.equal(hasBreedPreset('labrador'), false);
assert.equal(hasBreedPreset('dachshund'), false);
assert.equal(hasBreedPreset('rottweiler'), false);
assert.equal(hasBreedPreset('pit-bull'), false);
assert.deepEqual(selectProfileSource({ userPhotoUri: 'file://photo.jpg', presetSource: 1 }), { kind: 'user', source: 'file://photo.jpg' });
assert.deepEqual(selectProfileSource({ savedImageValue: 'raw/object-key.webp', presetSource: 1 }), { kind: 'saved', source: 'raw/object-key.webp' });
assert.deepEqual(selectProfileSource({ savedImageValue: 'https://cdn.example/dog.webp', presetSource: 1 }), { kind: 'saved', source: 'https://cdn.example/dog.webp' });
assert.deepEqual(selectProfileSource({ presetSource: 1 }), { kind: 'preset', source: 1 });
assert.deepEqual(selectProfileSource({}), { kind: 'placeholder' });
assert.equal(getImageSourceIdentity({ uri: 'file://a.webp' }), getImageSourceIdentity({ uri: 'file://a.webp' }), 'new objects with same URI are stable');
assert.notEqual(getImageSourceIdentity({ uri: 'file://a.webp' }), getImageSourceIdentity({ uri: 'file://b.webp' }), 'source transition remounts keyed image');
assert.equal(getImageSourceIdentity({ uri: 'file://a.webp' }), getImageSourceIdentity({ uri: 'file://a.webp' }), 'A->B->A retries A via keyed child remount');

const state = createDraftSubmissionState();
state.uploadKeys.set('photo:a', 'key-a');
confirmDogSave(state, 10);
assert.equal(getConfirmedDogId(state, undefined), 10, 'confirmed create id survives requery failure');
assert.equal(getConfirmedDogId(state, 10), 10, 'confirmed id wins after fields change');
resetDraftSubmission(state);
assert.equal(getConfirmedDogId(state, undefined), undefined, 'reset clears confirmed id');
assert.equal(state.uploadKeys.size, 0, 'reset clears upload keys');
resetDraftSubmission(state, 20);
assert.equal(getConfirmedDogId(state, 20), 20, 'startEdit isolates and owns edited dog id');
state.uploadKeys.set('preset:bichon', 'key-b');
resetDraftSubmission(state, 20);
assert.equal(state.uploadKeys.size, 0, 'startEdit clears prior draft upload keys');

let calls = 0;
const inFlight = runDraftSubmission(state, async () => { calls += 1; await Promise.resolve(); return 42; });
const duplicate = runDraftSubmission(state, async () => { calls += 1; return 99; });
assert.strictEqual(inFlight, duplicate, 'concurrent submits share one in-flight promise');
assert.equal(await duplicate, 42);
assert.equal(calls, 1);
const failing = runDraftSubmission(state, async () => { calls += 1; throw new Error('requery failed'); });
await assert.rejects(failing, /requery failed/);
await assert.rejects(runDraftSubmission(state, async () => { calls += 1; throw new Error('requery failed again'); }), /requery failed again/);
assert.equal(calls, 3, 'repeated requery failures remain rejected and never silently reuse old success');

const draft = { breed: '비숑 프리제', breedId: 'bichon', breedInputMode: 'selected', dogId: undefined, isDangerousDog: false, isNeutered: undefined, name: '콩이', personalities: [], profileImageUrl: '', size: 'SMALL', weight: '' };
const submissionState = createDraftSubmissionState();
let uploads = 0; let creates = 0; let updates = 0; let requeries = 0; let failRequery = true;
const deps = {
  createDog: async (payload) => { creates += 1; assert.equal(payload.profileImageUrl, 'object/preset.webp'); return { dogId: 77 }; },
  getLocalAssetUri: async () => 'file://preset.webp',
  getPresetProfile: (breedId, mode) => breedId === 'bichon' && mode === 'selected' ? 1 : undefined,
  loadDogs: async () => { requeries += 1; if (failRequery) throw new Error('requery failed'); return []; },
  setSkipped: async () => {},
  updateDog: async (dogId, payload) => { updates += 1; assert.equal(dogId, 77); assert.equal(payload.name, '콩이 수정'); return { dogId }; },
  uploadDogProfile: async (uri, mime) => { uploads += 1; assert.equal(mime, 'image/webp'); return 'object/preset.webp'; },
};
await assert.rejects(submitDogDraft(submissionState, draft, undefined, deps), /requery failed/);
assert.equal(uploads, 1); assert.equal(creates, 1); assert.equal(requeries, 1);
failRequery = false;
await submitDogDraft(submissionState, { ...draft, name: '콩이 수정' }, undefined, deps);
assert.equal(uploads, 1, 'successful preset upload is reused within the draft');
assert.equal(creates, 1, 'requery failure does not create a duplicate');
assert.equal(updates, 1, 'confirmed save id updates after edited fields');
resetDraftSubmission(submissionState);
await submitDogDraft(submissionState, draft, undefined, deps);
assert.equal(uploads, 2, 'reset starts a fresh upload cache');
const staleState = createDraftSubmissionState();
let releaseAsset; let staleUploads = 0; let staleCreates = 0;
const assetReady = new Promise((resolve) => { releaseAsset = resolve; });
const staleDeps = { ...deps, getLocalAssetUri: async () => { await assetReady; return 'file://stale.webp'; }, uploadDogProfile: async () => { staleUploads += 1; return 'stale'; }, createDog: async () => { staleCreates += 1; throw new Error('stale save must not reach backend'); } };
const staleSubmit = submitDogDraft(staleState, draft, undefined, staleDeps);
resetDraftSubmission(staleState);
releaseAsset();
await assert.rejects(staleSubmit, /등록 상태가 변경/);
assert.equal(staleUploads, 0, 'reset during asset download prevents upload');
assert.equal(staleCreates, 0, 'reset during asset download prevents create');

const failState = createDraftSubmissionState(); let failUploadAttempts = 0; let failCreateAttempts = 0;
const failDeps = { ...deps,
  uploadDogProfile: async () => { failUploadAttempts += 1; if (failUploadAttempts === 1) throw new Error('upload failed'); return 'object/photo.webp'; },
  createDog: async () => { failCreateAttempts += 1; if (failCreateAttempts === 1) throw new Error('create failed'); return { dogId: 88 }; },
  loadDogs: async () => [],
};
await assert.rejects(submitDogDraft(failState, { ...draft, profileImage: { uri: 'file://photo.jpg', mimeType: 'image/jpeg' } }, undefined, failDeps), /upload failed/);
await assert.rejects(submitDogDraft(failState, { ...draft, profileImage: { uri: 'file://photo.jpg', mimeType: 'image/jpeg' } }, undefined, failDeps), /create failed/);
await submitDogDraft(failState, { ...draft, profileImage: { uri: 'file://photo.jpg', mimeType: 'image/jpeg' } }, undefined, failDeps);
assert.equal(failUploadAttempts, 2, 'failed upload is retried fresh');
assert.equal(failCreateAttempts, 2, 'failed create is retried, then confirmed');

const rawState = createDraftSubmissionState(); let rawUploads = 0; let rawPayload;
const rawDeps = { ...deps, uploadDogProfile: async () => { rawUploads += 1; return 'wrong'; }, createDog: async (payload) => { rawPayload = payload; return { dogId: 89 }; }, loadDogs: async () => [] };
await submitDogDraft(rawState, { ...draft, profileImageUrl: 'raw/object-key.webp' }, undefined, rawDeps);
assert.equal(rawUploads, 0); assert.equal(rawPayload.profileImageUrl, 'raw/object-key.webp', 'raw saved key is preserved');

const photoState = createDraftSubmissionState(); let photoPayload;
const photoDeps = { ...deps, uploadDogProfile: async (uri) => `uploaded/${uri}`, createDog: async (payload) => { photoPayload = payload; return { dogId: 90 }; }, loadDogs: async () => [] };
await submitDogDraft(photoState, { ...draft, personalities: [4], breedId: 'poodle', profileImage: { uri: 'file://user.jpg', mimeType: 'image/jpeg' } }, { personalities: [], isNeutered: undefined }, photoDeps);
assert.equal(photoPayload.profileImageUrl, 'uploaded/file://user.jpg', 'user photo wins after breed change');
assert.equal(photoPayload.personalityIds.length, 0, 'skip-style overrides retain photo payload');

let releaseRequery; const requeryReady = new Promise((resolve) => { releaseRequery = resolve; }); const requeryState = createDraftSubmissionState();
const requeryDeps = { ...deps, loadDogs: async () => { await requeryReady; return []; } };
const requerySubmit = submitDogDraft(requeryState, draft, undefined, requeryDeps);
await Promise.resolve();
resetDraftSubmission(requeryState); releaseRequery();
await assert.rejects(requerySubmit, /등록 상태가 변경/);

console.log('dog preset tests: deterministic mapping/state/submission scenarios passed');
