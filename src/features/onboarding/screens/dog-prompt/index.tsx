import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BottomActions, OnboardingPage, ScreenTitle } from '@/features/onboarding/components';

import { useOnboarding } from '../../context';
import { styles } from './style';

import type { Href } from 'expo-router';

export function DogPromptScreen() {
  const router = useRouter();
  const { resetDraft, skipDogRegistration } = useOnboarding();

  return (
    <OnboardingPage>
      <View style={styles.promptHero} />
      <View style={styles.promptCopy}>
        <ScreenTitle style={styles.centerText}>
          우리 아이 등록하고{`\n`}딱 맞는 곳 찾아볼까요?
        </ScreenTitle>
        <Text color="textSecondary" fontSize={16} lineHeight={28} style={styles.centerText}>
          우리 아이가 갈 수 있는 곳만{`\n`}쏙쏙 골라드릴게요
        </Text>
      </View>
      <View style={styles.spacer} />
      <BottomActions>
        <Button
          onPress={() => {
            resetDraft();
            router.push('/onboarding/dog/step-1' as Href);
          }}
        >
          내 반려견 등록하기
        </Button>
        <Button
          fullWidth
          onPress={() => void skipDogRegistration().then(() => router.replace('/' as Href))}
          type="ghost"
        >
          앱 구경 먼저 할래요
        </Button>
      </BottomActions>
    </OnboardingPage>
  );
}
