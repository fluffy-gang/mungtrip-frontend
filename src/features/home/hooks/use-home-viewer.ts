import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { getMyDogs } from '@/features/dogs/api';
import { MOCK_DOGS } from '@/features/dogs/mock/dogs';
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
  const isMockSession = useAuthStore(state => state.isMockSession);
  const [viewerDogs, setViewerDogs] = useState<HomeDogProfile[]>([]);
  const [selectedDogIds, setSelectedDogIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      return;
    }

    // TODO(#11): 실제 로그인 화면(#9)이 머지되면 이 분기를 제거한다.
    // 목로그인 상태에는 진짜 토큰이 없으니 실제 API를 아예 호출하지 않는다.
    if (isMockSession) {
      void Promise.resolve().then(() => {
        if (!isMounted) return;

        const nextDogs = MOCK_DOGS.map(toHomeDogProfile);
        setViewerDogs(nextDogs);
        setSelectedDogIds(nextDogs.map(dog => dog.id));
      });
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
  }, [isLoggedIn, isMockSession]);

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
