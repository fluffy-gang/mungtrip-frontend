import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { deleteDog } from '@/features/dogs/api';
import { DogAvatar } from '../components/dog-avatar';
import { useDogs } from '../hooks/use-dogs';
import { styles } from '../styles';

import type { DogSize } from '@/features/dogs/types';

const sizeLabels: Record<DogSize, string> = {
  L: '대형견',
  M: '중형견',
  S: '소형견',
};

export function DogDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ dogId: string }>();
  const dogId = Number(params.dogId);
  const { dogs, hasError, loading, retry } = useDogs();
  const dog = dogs.find(item => item.dogId === dogId);

  const confirmDelete = () => {
    if (!dog) return;

    Alert.alert('반려견 정보를 삭제할까요?', '삭제한 정보는 복구할 수 없습니다.', [
      { style: 'cancel', text: '취소' },
      {
        style: 'destructive',
        text: '삭제',
        onPress: () => {
          void deleteDog(dog.dogId)
            .then(() => router.replace('/profile'))
            .catch(() => {
              Alert.alert('삭제하지 못했어요', '잠시 후 다시 시도해주세요.');
            });
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader onBack={() => router.back()} title="반려견 정보" />
        {loading ? (
          <StatePanel loading title="반려견 정보를 불러오는 중이에요" />
        ) : hasError ? (
          <StatePanel onRetry={retry} title="반려견 정보를 불러오지 못했어요" />
        ) : !dog ? (
          <StatePanel title="반려견 정보를 찾을 수 없어요" />
        ) : (
          <>
            <View style={styles.detailImageWrap}>
              <DogAvatar imageUrl={dog.profileImageUrl} large />
              <Text style={[styles.profileName, { marginTop: 12 }]}>{dog.name}</Text>
            </View>
            <View style={styles.infoList}>
              <InfoRow label="견종" value={dog.breed} />
              <InfoRow label="크기" value={sizeLabels[dog.size]} />
              <InfoRow label="몸무게" value={`${dog.weight}kg`} />
              <InfoRow
                label="성격"
                value={dog.personalities.map(item => item.name).join(', ') || '없음'}
              />
              <InfoRow label="중성화" value={dog.isNeutered ? '완료' : '미완료'} />
              <InfoRow
                label="맹견 여부"
                value={dog.isDangerousDog ? '해당' : '해당 없음'}
              />
            </View>
            <View style={styles.actions}>
              <Button
                onPress={() =>
                  router.push({
                    pathname: '/profile/dogs/[dogId]/edit',
                    params: { dogId: String(dog.dogId) },
                  })
                }
              >
                정보 수정
              </Button>
              <Pressable accessibilityRole="button" onPress={confirmDelete}>
                <Text style={styles.dangerText}>반려견 정보 삭제</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
