import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TagSelectInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  BottomActions,
  DogPlaceholder,
  FadeSequence,
  InlineError,
  OnboardingPage,
  ScreenTitle,
  StepHeader,
} from '@/features/onboarding/components';

import { tokens } from '@/constants/tokens';
import { useOnboarding } from '../../context';
import { getBreedPreset, isRenderableImageUri } from '../../preset-assets';
import { selectProfileSource } from '../../preset-rules';
import { SafeImage } from '../../components/safe-image';
import { getErrorMessage } from '@/utils/error';
import { appendObjectParticle } from '@/utils/string';
import { styles } from './style';

import type { Href } from 'expo-router';

interface DogStepThreeScreenProps {
  completionPath?: Href;
}

export function DogStepThreeScreen({
  completionPath = '/onboarding/complete' as Href,
}: DogStepThreeScreenProps = {}) {
  const router = useRouter();
  const { draft, personalities, setDraft, submitDog } = useOnboarding();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const chooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled) setDraft({ profileImage: result.assets[0] });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  const submit = async (skipExtras: boolean) => {
    if (!draft.profileImage?.uri && !draft.profileImageUrl && !getBreedPreset(draft.breedId, draft.breedInputMode)) {
      setError('프로필 사진을 등록해주세요.');
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      await submitDog(
        skipExtras
          ? { isNeutered: undefined, personalities: [] }
          : undefined,
      );
      router.replace(completionPath);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
      setPending(false);
    }
  };

  const personalityOptions = personalities.map((item) => ({
    label: item.name,
    value: String(item.id),
  }));
  const preset = getBreedPreset(draft.breedId, draft.breedInputMode);
  const selectedProfile = selectProfileSource({
    userPhotoUri: draft.profileImage?.uri,
    savedImageValue: draft.profileImageUrl,
    presetSource: preset?.profile,
  });
  const imageSource = selectedProfile.kind === 'saved'
    ? (isRenderableImageUri(selectedProfile.source) ? selectedProfile.source : undefined)
    : selectedProfile.source;
  const savedImageUnavailable = selectedProfile.kind === 'saved' && !isRenderableImageUri(selectedProfile.source);
  const selectedPersonalities = draft.personalities.map(String);
  const neuterValue = draft.isNeutered == null
    ? 'unknown'
    : draft.isNeutered
      ? 'yes'
      : 'no';

  return (
    <OnboardingPage>
      <StepHeader current={3} disabled={pending} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.formContent}>
        <FadeSequence>
          <ScreenTitle>
            {appendObjectParticle(draft.name)}{`\n`}더 알려주세요 (선택)
          </ScreenTitle>
        </FadeSequence>
        <FadeSequence delay={80}>
          <View style={styles.profileBlock}>
            <Pressable
              accessibilityLabel="프로필 사진 변경"
              accessibilityState={{ disabled: pending }}
              disabled={pending}
              onPress={() => void chooseImage()}
            >
              {imageSource || savedImageUnavailable ? (
                <SafeImage
                  contentFit="contain"
                  fallback={<DogPlaceholder style={styles.profileImage} />}
                  source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                  style={styles.profileImage}
                  unavailableLabel="저장된 반려견 이미지를 불러올 수 없어요."
                />
              ) : (
                <DogPlaceholder />
              )}
              <View style={styles.editBadge}>
                <Icon
                  name="edit"
                  size={16}
                  tintColor={tokens.colors.semantic.light.textSecondary}
                />
              </View>
            </Pressable>
          </View>
          <View style={styles.formFields}>
            {personalityOptions.length ? (
              <View style={styles.fieldBlock}>
                <Text color="textSecondary" fontSize={16} fontWeight="bold" lineHeight={24}>
                  성향 (여러개 가능)
                </Text>
                <TagSelectInput
                  mode="multiple"
                  onChange={(values) => setDraft({
                    personalities: (values as string[]).map(Number),
                  })}
                  options={personalityOptions}
                  value={selectedPersonalities}
                />
              </View>
            ) : null}
            <View style={styles.fieldBlock}>
              <Text color="textSecondary" fontSize={16} fontWeight="bold" lineHeight={24}>
                중성화 여부
              </Text>
              <TagSelectInput
                mode="single"
                onChange={(value) => setDraft({
                  isNeutered: value === 'unknown' ? undefined : value === 'yes',
                })}
                options={[
                  { label: '완료', value: 'yes' },
                  { label: '미완료', value: 'no' },
                  { label: '모름', value: 'unknown' },
                ]}
                value={neuterValue}
                variant="outlined"
              />
            </View>
            <InlineError message={error} />
          </View>
        </FadeSequence>
      </ScrollView>
      <BottomActions>
        <Button disabled={pending} onPress={() => void submit(false)}>
          {pending ? '저장 중...' : '완료'}
        </Button>
        <Button
          disabled={pending}
          fullWidth
          labelStyle={styles.skipButtonLabel}
          onPress={() => void submit(true)}
          type="ghost"
        >
          건너뛰기
        </Button>
      </BottomActions>
    </OnboardingPage>
  );
}
