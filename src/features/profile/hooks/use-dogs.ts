import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMyDogs } from '@/features/dogs/api';

import type { Dog, DogListSize, ProfileDog } from '@/features/dogs/types';

const toProfileSize: Record<Dog['size'], DogListSize> = {
  L: 'LARGE',
  M: 'MEDIUM',
  S: 'SMALL',
};

const toProfileDog = (dog: Dog): ProfileDog => ({
  breed: { breedId: 0, name: dog.breed },
  dogId: dog.dogId,
  imageUrl: dog.profileImageUrl,
  isDangerousDog: dog.isDangerousDog,
  isNeutered: dog.isNeutered,
  name: dog.name,
  personalities: dog.personalities,
  size: toProfileSize[dog.size],
  weight: dog.weight,
});

export function useDogs(enabled = true) {
  const [dogs, setDogs] = useState<ProfileDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey(currentKey => currentKey + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      let isMounted = true;

      const run = async () => {
        await Promise.resolve();
        if (!isMounted) return;

        setLoading(true);
        setHasError(false);

        try {
          const nextDogs = (await getMyDogs()).map(toProfileDog);
          if (isMounted) setDogs(nextDogs);
        } catch {
          if (isMounted) setHasError(true);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      void run();
      return () => {
        isMounted = false;
      };
    }, [enabled, reloadKey]),
  );

  return { dogs, hasError, loading, retry };
}
