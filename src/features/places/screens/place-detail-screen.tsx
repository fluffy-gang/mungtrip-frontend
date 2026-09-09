import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

import { parseScenario, usePlaceEnvironment } from '../detail/environment';
import { PlaceDetailView } from '../detail/place-detail-view';
import { placeStyles as s } from '../detail/styles';
import { parsePlaceId } from '../detail/validation';

export function PlaceDetailScreen() {
  const params = useLocalSearchParams<{ id: string; source?: string; scenario?: string }>();
  const router = useRouter();
  const id = parsePlaceId(params.id);
  const source = params.source === 'mock' ? 'mock' : 'real';
  const scenario = parseScenario(params.scenario);
  const { provider, integration } = usePlaceEnvironment(source, scenario);
  const back = () => router.canGoBack() ? router.back() : router.replace('/');
  if (!id || provider.source !== source) return <View style={s.center}><Text style={s.body}>장소 정보가 올바르지 않아요.</Text><Button onPress={back}>돌아가기</Button></View>;
  return <PlaceDetailView key={`${id}:${source}`} placeId={id} provider={provider} integration={integration} scenario={scenario}
    onBack={back} onReviews={() => router.push({ pathname: '/places/[id]/reviews', params: { id, source, scenario } })}
    onPlace={nextId => router.push({ pathname: '/places/[id]', params: { id: nextId, source, scenario } })} />;
}
