import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { getMyDogs } from '@/features/dogs/api';
import type { Dog } from '@/features/dogs/types';
import type { DogSizeTagCode, HomeDogProfile, HomeViewer } from '../types';


const EMPTY_HOME_DOGS: HomeDogProfile[] = [];
const EMPTY_DOG_IDS: number[] = [];

const dogSizeTagCodes: Record<Dog['size'], DogSizeTagCode> = {
  S: 'SMALL_DOG',
  M: 'MEDIUM_DOG',
  L: 'LARGE_DOG',
};

const toHomeDogProfile = (dog: Dog): HomeDogProfile => ({
  breed: dog.breed,
  id: dog.dogId,
  imageUrl: dog.profileImageUrl,
  isDangerousDog: dog.isDangerousDog ?? false,
  name: dog.name,
  sizeTagCode: dogSizeTagCodes[dog.size],
});

export function useHomeViewer(): HomeViewer {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const [viewerDogs, setViewerDogs] = useState<HomeDogProfile[]>([]);
  const [selectedDogIds, setSelectedDogIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      return;
    }

    void getMyDogs()
      .then(dogs => {
        if (!isMounted) {
          return;
        }

        const nextDogs = dogs.map(toHomeDogProfile);
        const nextDogIds = nextDogs.map(dog => dog.id);

        setViewerDogs(nextDogs);
        setSelectedDogIds(currentDogIds => {
          const retainedDogIds = currentDogIds.filter(dogId =>
            nextDogIds.includes(dogId),
          );

          return retainedDogIds.length > 0 ? retainedDogIds : nextDogIds;
        });
      })
      .catch(() => {
        if (isMounted) {
          setViewerDogs([]);
          setSelectedDogIds([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const dogs = isLoggedIn ? viewerDogs : EMPTY_HOME_DOGS;
  const selectedDogs = useMemo(
    () => dogs.filter(dog => selectedDogIds.includes(dog.id)),
    [dogs, selectedDogIds],
  );
  const activeDog = selectedDogs[0] ?? dogs[0] ?? null;
  const saveDogSelection = useCallback((dogIds: number[]) => {
    setSelectedDogIds(dogIds);
  }, []);

  return {
    activeDog,
    dogs,
    dogIds: isLoggedIn ? selectedDogIds : EMPTY_DOG_IDS,
    isLoggedIn,
    saveDogSelection,
    selectedDogIds,
    selectedDogs,
  };
}
