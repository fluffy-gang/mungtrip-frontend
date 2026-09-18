import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import {
  CheckboxInput,
  NumberInputField,
  SegmentInput,
  TextInputField,
  ToggleInput,
} from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  BottomActions,
  BottomSheet,
  FadeSequence,
  OnboardingPage,
  ScreenTitle,
  StepHeader,
} from '@/features/onboarding/components';

import { DOG_SIZE_OPTIONS } from '../../constants';
import { useOnboarding } from '../../context';
import { styles } from './style';

import type { Href } from 'expo-router';

interface DogStepTwoScreenProps {
  nextPath?: Href;
}

export function DogStepTwoScreen({
  nextPath = '/onboarding/dog/step-3' as Href,
}: DogStepTwoScreenProps = {}) {
  const router = useRouter();
  const { draft, setDraft } = useOnboarding();
  const [dangerSheet, setDangerSheet] = useState(false);
  const [dangerConfirmed, setDangerConfirmed] = useState(false);
  const weight = Number(draft.weight);
  const weightValid = !draft.weight.trim() || (!Number.isNaN(weight) && weight > 0);
  const selectedMode = draft.breedInputMode === 'selected';

  return (
    <OnboardingPage>
      <StepHeader current={2} onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <FadeSequence>
            <ScreenTitle>
              {selectedMode ? '크기랑 이름도 알려주세요' : '반려견 정보를 알려주세요'}
            </ScreenTitle>
          </FadeSequence>
          <FadeSequence delay={80}>
            <View style={styles.formFields}>
              {!selectedMode ? (
                <TextInputField
                  label="견종 (선택)"
                  onChange={(breed) => setDraft({ breed })}
                  placeholder="견종을 입력해주세요"
                  value={draft.breed}
                />
              ) : null}
              <View style={styles.fieldBlock}>
                <Text color="textSecondary" fontSize={16} fontWeight="bold" lineHeight={24}>
                  사이즈
                </Text>
                <SegmentInput
                  onChange={(size) => setDraft({ size })}
                  options={DOG_SIZE_OPTIONS}
                  value={draft.size}
                />
                {selectedMode ? (
                  <Text color="textDisabled" fontSize={12} lineHeight={20}>
                    * {draft.breed} 기반으로 자동 설정되었으나 수정 가능해요.
                  </Text>
                ) : null}
              </View>
              <View style={styles.fieldBlock}>
                <Text color="textSecondary" fontSize={16} fontWeight="bold" lineHeight={24}>
                  맹견 여부
                </Text>
                <ToggleInput
                  label="법정 맹견에 해당하나요?"
                  onChange={(next) => {
                    if (next) {
                      setDangerConfirmed(false);
                      setDangerSheet(true);
                    } else {
                      setDraft({ isDangerousDog: false });
                    }
                  }}
                  value={draft.isDangerousDog}
                />
              </View>
              <TextInputField
                label="이름 (선택)"
                maxLength={20}
                onChange={(name) => setDraft({ name })}
                placeholder="이름을 입력해주세요"
                value={draft.name}
              />
              <NumberInputField
                errorText={weightValid ? undefined : '0보다 큰 숫자를 입력해주세요.'}
                label="몸무게 (선택)"
                onChange={(nextWeight) => setDraft({ weight: nextWeight })}
                placeholder="몸무게를 입력해주세요"
                unitText="kg"
                value={draft.weight}
              />
            </View>
          </FadeSequence>
        </ScrollView>
        <BottomActions>
          <Button
            disabled={!weightValid}
            onPress={() => router.push(nextPath)}
          >
            다음
          </Button>
        </BottomActions>
      </KeyboardAvoidingView>
      <BottomSheet onClose={() => setDangerSheet(false)} visible={dangerSheet}>
        <View style={styles.sheetContent}>
          <View style={styles.warningIcon}>
            <Text fontSize={28} lineHeight={32}>!</Text>
          </View>
          <Text fontSize={18} fontWeight="bold" lineHeight={24}>맹견 등록 안내</Text>
          <View style={styles.sheetCopy}>
            <Text color="primary" fontSize={16} lineHeight={24}>
              법정 맹견은 목줄 및 입마개 착용이 필수입니다.
            </Text>
            <Text color="textTertiary" fontSize={16} lineHeight={24}>
              입마개 착용 없이는 입장이 제한되는 장소가 있어요.
            </Text>
            <Text
              color="textTertiary"
              fontSize={16}
              lineHeight={28}
              style={styles.centerText}
            >
              해당 정보를 바탕으로 장소별 입장 가능 여부를{`\n`}
              정확하게 안내해드릴게요.
            </Text>
          </View>
          <CheckboxInput
            label="안내를 확인했습니다"
            onChange={setDangerConfirmed}
            value={dangerConfirmed}
          />
          <Button
            disabled={!dangerConfirmed}
            onPress={() => {
              setDraft({ isDangerousDog: true });
              setDangerSheet(false);
            }}
          >
            확인했어요
          </Button>
          <Button fullWidth onPress={() => setDangerSheet(false)} type="ghost">
            취소
          </Button>
        </View>
      </BottomSheet>
    </OnboardingPage>
  );
}
