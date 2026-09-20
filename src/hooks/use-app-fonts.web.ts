import { useFonts } from 'expo-font';

export function useAppFonts() {
  const [loaded, error] = useFonts({
    Pretendard: require('../../assets/fonts/Pretendard-Regular.otf'),
    'Hakgyoansim Dunggeunmiso': require('../../assets/fonts/Hakgyoansim Dunggeunmiso OTF B.otf'),
  });

  return loaded || Boolean(error);
}
