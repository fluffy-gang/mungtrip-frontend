import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { DogEditForm } from '../components/dog-edit-form';
import { useDogs } from '../hooks/use-dogs';
import { styles } from '../styles';

/** Route shell that resolves the selected dog before rendering its edit form. */
export function DogEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dogId: dogIdParam } = useLocalSearchParams<{ dogId: string }>();
  const { dogs, hasError, loading, retry } = useDogs();
  const dog = dogs.find(item => item.dogId === Number(dogIdParam));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {dog ? (
        <DogEditForm
          dog={dog}
          onBack={() => router.back()}
          onDeleted={() => router.replace('/profile')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader onBack={() => router.back()} title="반려견 정보 수정" />
          {loading ? (
            <StatePanel loading title="반려견 정보를 불러오는 중이에요" />
          ) : hasError ? (
            <StatePanel onRetry={retry} title="반려견 정보를 불러오지 못했어요" />
          ) : (
            <StatePanel title="반려견 정보를 찾을 수 없어요" />
          )}
        </ScrollView>
      )}
    </View>
  );
}
