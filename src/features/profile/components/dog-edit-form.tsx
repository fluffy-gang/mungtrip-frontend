import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';

import { showDialog } from '@/components/ui/dialog';

import { getDogPersonalities } from '@/features/dog-personalities/api';
import { updateDog } from '@/features/dogs/api';
import { getBreedPreset, getLocalAssetUri } from '@/features/onboarding/preset-assets';
import { uploadFile } from '@/features/uploads/api';
import { BreedSelectionView } from './breed-selection-view';
import { DogDeleteDialog } from './dog-delete-dialog';
import { DogEditFormView } from './dog-edit-form-view';
import { dogSizeOptions } from './dog-edit-form-types';
import { useDogDeletion } from '../hooks/use-dog-deletion';

import type { DogPersonality } from '@/features/dog-personalities/types';
import type { CreateDogRequest, DogSize, ProfileDog } from '@/features/dogs/types';
import type { DogEditableField, DogEditableFieldAction } from './dog-edit-form-types';
import type { NeuteredStatus } from './neutered-status-selector';

interface DogEditFormProps {
  dog: ProfileDog;
  onBack: () => void;
  onDeleted: () => void;
}

const toFormSize: Record<ProfileDog['size'], DogSize> = { LARGE: 'L', MEDIUM: 'M', SMALL: 'S' };

function toNeuteredStatus(value: boolean | undefined): NeuteredStatus {
  if (value == null) return 'unknown';

  return value ? 'yes' : 'no';
}

/** Coordinates dog-edit API writes while the form view stays presentational. */
export function DogEditForm({ dog, onBack, onDeleted }: DogEditFormProps) {
  const [name, setName] = useState(dog.name);
  const [breed, setBreed] = useState(dog.breed.name);
  const [weight, setWeight] = useState(dog.weight ? String(dog.weight) : '');
  const [size, setSize] = useState<DogSize>(toFormSize[dog.size]);
  const [personalityIds, setPersonalityIds] = useState(dog.personalities.map(item => String(item.id)));
  const [neuteredStatus, setNeuteredStatus] = useState<NeuteredStatus>(
    toNeuteredStatus(dog.isNeutered),
  );
  const [isDangerousDog, setIsDangerousDog] = useState(dog.isDangerousDog);
  const [personalities, setPersonalities] = useState<DogPersonality[]>([]);
  const [activeField, setActiveField] = useState<DogEditableField>(null);
  const [draftText, setDraftText] = useState('');
  const [draftWeight, setDraftWeight] = useState(weight);
  const [draftSize, setDraftSize] = useState<DogSize>(size);
  const [draftPersonalityIds, setDraftPersonalityIds] = useState(personalityIds);
  const [saving, setSaving] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string>();
  const [profileImageKey, setProfileImageKey] = useState<string>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectingBreed, setSelectingBreed] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getDogPersonalities()
      .then(items => mounted && setPersonalities(items))
      .catch(() => mounted && setPersonalities([]));
    return () => {
      mounted = false;
    };
  }, []);

  const personalityOptions = useMemo(
    () => personalities.map(item => ({ label: item.name, value: String(item.id) })),
    [personalities],
  );
  const personalityNames = personalityIds
    .map(id => {
      const matchedPersonality = personalities.find(item => String(item.id) === id);

      return matchedPersonality?.name ?? dog.personalities.find(item => String(item.id) === id)?.name;
    })
    .filter((personality): personality is string => Boolean(personality));
  const personalityLabel = personalityNames.length
    ? `${personalityNames.slice(0, 2).join(', ')}${
        personalityNames.length > 2 ? ` 외 ${personalityNames.length - 2}개` : ''
      }`
    : '없음';
  const sizeLabel = dogSizeOptions.find(option => option.value === size)?.label ?? '';
  const {
    closeDeleteDialog,
    confirmDeletion,
    deleting,
    deleteDialogVisible,
    requestDeletion,
  } = useDogDeletion(dog.dogId, onDeleted);

  const buildRequest = (patch: Partial<CreateDogRequest> = {}): CreateDogRequest => ({
    breed: breed.trim(),
    isDangerousDog,
    isNeutered: neuteredStatus === 'unknown' ? undefined : neuteredStatus === 'yes',
    name: name.trim(),
    personalityIds: personalityIds.map(Number),
    profileImageUrl: profileImageKey ?? dog.imageUrl,
    size,
    weight: weight.trim() ? Number(weight) : undefined,
    ...patch,
  });

  const persistDog = async (patch: Partial<CreateDogRequest> = {}) => {
    if (saving) return false;

    setSaving(true);
    try {
      await updateDog(dog.dogId, buildRequest(patch));
      return true;
    } catch {
      showDialog('수정하지 못했어요', '잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openField = (field: DogEditableFieldAction) => {
    if (field === 'breed') {
      setActiveField(null);
      setSelectingBreed(true);
      return;
    }

    setActiveField(field);
    if (field === 'name') setDraftText(name);
    if (field === 'size') {
      setDraftSize(size);
      setDraftWeight(weight);
    }
    if (field === 'personality') setDraftPersonalityIds(personalityIds);
  };

  const applyField = async () => {
    if (activeField === 'name') {
      const nextName = draftText.trim();
      if (!nextName) return;
      if (await persistDog({ name: nextName })) {
        setName(nextName);
        setActiveField(null);
      }
      return;
    }

    if (activeField === 'size') {
      const nextWeight = draftWeight.trim();
      const parsedWeight = nextWeight ? Number(nextWeight) : undefined;
      if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) return;
      if (await persistDog({ size: draftSize, weight: parsedWeight })) {
        setSize(draftSize);
        setWeight(nextWeight);
        setActiveField(null);
      }
      return;
    }

    if (activeField === 'personality') {
      const nextPersonalityIds = draftPersonalityIds.map(Number);
      if (await persistDog({ personalityIds: nextPersonalityIds })) {
        setPersonalityIds(draftPersonalityIds);
        setActiveField(null);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPendingImageUri(asset.uri);
    setUploadingImage(true);
    try {
      const objectKey = await uploadFile(asset.uri, asset.mimeType ?? 'image/jpeg', 'DOG_PROFILE_IMAGE');
      if (await persistDog({ profileImageUrl: objectKey })) {
        setProfileImageKey(objectKey);
      } else {
        setPendingImageUri(undefined);
      }
    } catch {
      setPendingImageUri(undefined);
      showDialog('이미지를 업로드하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateNeuteredStatus = async (nextStatus: NeuteredStatus) => {
    const isNeutered = nextStatus === 'unknown' ? undefined : nextStatus === 'yes';
    if (await persistDog({ isNeutered })) setNeuteredStatus(nextStatus);
  };

  const toggleDangerousDog = async (nextValue: boolean) => {
    if (await persistDog({ isDangerousDog: nextValue })) setIsDangerousDog(nextValue);
  };

  if (selectingBreed) {
    return (
      <BreedSelectionView
        initialBreed={breed}
        onBack={() => setSelectingBreed(false)}
        onSelect={selection => {
          if (!selection.breed) {
            setSelectingBreed(false);
            return;
          }

          void (async () => {
            const hasPhoto = Boolean(profileImageKey ?? dog.imageUrl);
            const preset = hasPhoto ? undefined : getBreedPreset(selection.breedId, 'selected');
            let presetImageKey: string | undefined;
            let presetLocalUri: string | undefined;

            if (preset) {
              try {
                presetLocalUri = await getLocalAssetUri(preset.profile);
                presetImageKey = await uploadFile(presetLocalUri, 'image/webp', 'DOG_PROFILE_IMAGE');
              } catch {
                presetImageKey = undefined;
                presetLocalUri = undefined;
                showDialog('사진을 반영하지 못했어요', '견종은 저장하고, 사진은 잠시 후 다시 시도해주세요.');
              }
            }

            const patch: Partial<CreateDogRequest> = {
              breed: selection.breed,
              isDangerousDog: selection.isDangerousDog ?? isDangerousDog,
              size: selection.size ?? size,
            };
            if (presetImageKey) patch.profileImageUrl = presetImageKey;

            const saved = await persistDog(patch);
            if (!saved) return;
            setBreed(selection.breed);
            if (selection.size) setSize(selection.size);
            if (selection.isDangerousDog !== undefined) setIsDangerousDog(selection.isDangerousDog);
            if (presetImageKey) {
              setProfileImageKey(presetImageKey);
              if (presetLocalUri) setPendingImageUri(presetLocalUri);
            }
            setSelectingBreed(false);
          })();
        }}
      />
    );
  }

  const sheetDisabled = activeField === 'name'
    ? !draftText.trim() || saving
    : activeField === 'size'
      ? Boolean(draftWeight.trim() && (!Number.isFinite(Number(draftWeight)) || Number(draftWeight) <= 0)) || saving
      : saving;
  const sheetTitle = {
    name: '이름을 입력해주세요',
    personality: '성향을 선택해주세요',
    size: '사이즈와 몸무게를 설정해주세요',
  }[activeField ?? 'name'];

  return (
    <>
      <DogEditFormView
        activeField={activeField}
        breed={breed}
        deleting={deleting}
        dog={{ ...dog, name }}
        draftPersonalityIds={draftPersonalityIds}
        draftSize={draftSize}
        draftText={draftText}
        draftWeight={draftWeight}
        isDangerousDog={isDangerousDog}
        neuteredStatus={neuteredStatus}
        onBack={onBack}
        onCloseSheet={() => setActiveField(null)}
        onOpenField={openField}
        onPickImage={() => void pickImage()}
        onSaveSheet={() => void applyField()}
        onSelectPersonality={setDraftPersonalityIds}
        onSelectSize={setDraftSize}
        onSetDraftText={setDraftText}
        onSetDraftWeight={setDraftWeight}
        onToggleDangerousDog={value => void toggleDangerousDog(value)}
        onUpdateNeuteredStatus={status => void updateNeuteredStatus(status)}
        pendingImageUri={pendingImageUri}
        personalityLabel={personalityLabel}
        personalityOptions={personalityOptions}
        requestDeletion={requestDeletion}
        saving={saving}
        sheetDisabled={sheetDisabled}
        sheetTitle={sheetTitle}
        sizeLabel={sizeLabel}
        uploadingImage={uploadingImage}
        weight={weight}
      />
      <DogDeleteDialog
        deleting={deleting}
        onClose={closeDeleteDialog}
        onDelete={() => void confirmDeletion()}
        visible={deleteDialogVisible}
      />
    </>
  );
}
