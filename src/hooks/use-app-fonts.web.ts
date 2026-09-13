import { useFonts } from 'expo-font';

export function useAppFonts() {
  const [loaded, error] = useFonts({
    'Hakgyoansim Dunggeunmiso': require('../../assets/fonts/Hakgyoansim Dunggeunmiso OTF B.otf'),
  });

  return loaded || Boolean(error);
}
