import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { DogAvatar } from '../components/dog-avatar';
import { DogDeleteDialog } from '../components/dog-delete-dialog';
import { useDogDeletion } from '../hooks/use-dog-deletion';
import { useDogs } from '../hooks/use-dogs';
import { styles } from '../styles';

import type { ProfileDog } from '@/features/dogs/types';

const sizeLabels: Record<ProfileDog['size'], string> = {
  LARGE: '대형견',
  MEDIUM: '중형견',
  SMALL: '소형견',
};

export function DogDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ dogId: string }>();
  const dogId = Number(params.dogId);
  const { dogs, hasError, loading, retry } = useDogs();
  const dog = dogs.find(item => item.dogId === dogId);
  const {
    closeDeleteDialog,
    confirmDeletion,
    deleting,
    deleteDialogVisible,
    requestDeletion,
  } = useDogDeletion(dogId, () => router.replace('/profile'));

  const confirmDelete = () => {
    if (!dog) return;

    requestDeletion();
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
              <DogAvatar imageUrl={dog.imageUrl} large />
              <Text style={[styles.profileName, { marginTop: 12 }]}>{dog.name}</Text>
            </View>
            <View style={styles.infoList}>
              <InfoRow label="견종" value={dog.breed.name} />
              <InfoRow label="사이즈" value={sizeLabels[dog.size]} />
              <InfoRow label="몸무게" value={dog.weight ? `${dog.weight}kg` : '없음'} />
              <InfoRow
                label="성격"
                value={dog.personalities.map(item => item.name).join(', ') || '없음'}
              />
              <InfoRow
                label="중성화"
                value={dog.isNeutered == null ? '모름' : dog.isNeutered ? '완료' : '미완료'}
              />
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
              <Pressable accessibilityRole="button" disabled={deleting} onPress={confirmDelete}>
                <Text style={styles.dangerText}>반려견 정보 삭제</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
      <DogDeleteDialog
        deleting={deleting}
        onClose={closeDeleteDialog}
        onDelete={() => void confirmDeletion()}
        visible={deleteDialogVisible}
      />
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
