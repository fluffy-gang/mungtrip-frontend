import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import {
  NumberInputField,
  SegmentInput,
  TagSelectInput,
  TextInputField,
  ToggleInput,
} from '@/components/ui/input';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { getDogPersonalities } from '@/features/dog-personalities/api';
import { updateDog } from '@/features/dogs/api';
import { uploadFile } from '@/features/uploads/api';
import { DogAvatar } from '../components/dog-avatar';
import { useDogs } from '../hooks/use-dogs';
import { styles } from '../styles';

import type { Dog, DogSize } from '@/features/dogs/types';
import type { DogPersonality } from '@/features/dog-personalities/types';

const sizeOptions = [
  { label: '소형견', value: 'S' },
  { label: '중형견', value: 'M' },
  { label: '대형견', value: 'L' },
] as const;

export function DogEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ dogId: string }>();
  const dogId = Number(params.dogId);
  const { dogs, hasError, loading, retry } = useDogs();
  const dog = dogs.find(item => item.dogId === dogId);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader onBack={() => router.back()} title="반려견 정보 수정" />
        {loading ? (
          <StatePanel loading title="반려견 정보를 불러오는 중이에요" />
        ) : hasError ? (
          <StatePanel onRetry={retry} title="반려견 정보를 불러오지 못했어요" />
        ) : !dog ? (
          <StatePanel title="반려견 정보를 찾을 수 없어요" />
        ) : (
          <DogEditForm
            dog={dog}
            onSaved={() =>
              router.replace({
                pathname: '/profile/dogs/[dogId]',
                params: { dogId: String(dog.dogId) },
              })
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

function DogEditForm({ dog, onSaved }: { dog: Dog; onSaved: () => void }) {
  const [name, setName] = useState(dog.name);
  const [weight, setWeight] = useState(String(dog.weight));
  const [size, setSize] = useState<DogSize>(dog.size);
  const [personalityIds, setPersonalityIds] = useState<string[]>(
    dog.personalities.map(item => String(item.id)),
  );
  const [isNeutered, setIsNeutered] = useState(dog.isNeutered ?? false);
  const [isDangerousDog, setIsDangerousDog] = useState(dog.isDangerousDog ?? false);
  const [personalities, setPersonalities] = useState<DogPersonality[]>([]);
  const [saving, setSaving] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | undefined>();
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const personalityOptions = useMemo(
    () => personalities.map(item => ({ label: item.name, value: String(item.id) })),
    [personalities],
  );
  const parsedWeight = Number(weight);
  const nameError = name.trim() ? undefined : '이름을 입력해주세요.';
  const weightError =
    Number.isFinite(parsedWeight) && parsedWeight > 0
      ? undefined
      : '올바른 몸무게를 입력해주세요.';

  useEffect(() => {
    let isMounted = true;

    void getDogPersonalities()
      .then(items => {
        if (isMounted) setPersonalities(items);
      })
      .catch(() => {
        if (isMounted) setPersonalities([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileType = asset.mimeType ?? 'image/jpeg';

    setPendingImageUri(asset.uri);
    setUploadingImage(true);
    try {
      const uploadedProfileImageUrl = await uploadFile(
        asset.uri,
        fileType,
        'DOG_PROFILE_IMAGE',
      );
      setProfileImageUrl(uploadedProfileImageUrl);
    } catch {
      setPendingImageUri(undefined);
      Alert.alert('이미지를 업로드하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async () => {
    if (nameError || weightError || saving || uploadingImage) return;

    setSaving(true);
    try {
      await updateDog(dog.dogId, {
        breed: dog.breed,
        isDangerousDog,
        isNeutered,
        name: name.trim(),
        personalityIds: personalityIds.map(Number),
        profileImageUrl: profileImageUrl ?? dog.profileImageUrl,
        size,
        weight: parsedWeight,
      });
      onSaved();
    } catch {
      Alert.alert('저장하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.detailImageWrap}>
        <Pressable
          accessibilityLabel="반려견 사진 변경"
          accessibilityRole="button"
          disabled={uploadingImage}
          onPress={() => void pickImage()}
          style={styles.avatarEditWrap}
        >
          <DogAvatar imageUrl={pendingImageUri ?? dog.profileImageUrl} large />
          {uploadingImage ? (
            <View style={styles.avatarUploadOverlay}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.avatarEditBadge}>
              <SymbolView
                name={{ android: 'edit', ios: 'pencil', web: 'edit' }}
                size={14}
                tintColor="#FFFFFF"
              />
            </View>
          )}
        </Pressable>
      </View>
      <TextInputField
        errorText={nameError}
        label="이름"
        onChange={setName}
        required
        value={name}
      />
      <TextInputField
        disabled
        helperText="견종 변경은 추후 지원할 예정이에요."
        label="견종"
        onChange={() => undefined}
        value={dog.breed}
      />
      <View>
        <Text style={styles.fieldLabel}>크기</Text>
        <SegmentInput onChange={setSize} options={sizeOptions} value={size} />
      </View>
      <NumberInputField
        errorText={weightError}
        label="몸무게"
        onChange={setWeight}
        required
        unitText="kg"
        value={weight}
      />
      <View>
        <Text style={styles.fieldLabel}>성격</Text>
        <TagSelectInput
          mode="multiple"
          onChange={value => setPersonalityIds(value as string[])}
          options={personalityOptions}
          value={personalityIds}
          variant="outlined"
        />
      </View>
      <ToggleInput label="중성화했어요" onChange={setIsNeutered} value={isNeutered} />
      <ToggleInput
        label="맹견에 해당해요"
        onChange={setIsDangerousDog}
        value={isDangerousDog}
      />
      <Button
        disabled={Boolean(nameError || weightError || saving || uploadingImage)}
        onPress={() => void save()}
      >
        {saving ? '저장 중...' : '저장'}
      </Button>
    </View>
  );
}
