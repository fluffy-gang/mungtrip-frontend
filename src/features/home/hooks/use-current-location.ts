import type { LocationObject } from 'expo-location';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { JEJU_MAP_CAMERA } from '../constants';
import type { LocationCoordinate, MapCamera } from '../types';
import { loadLocationModule } from '../utils/native-modules';

const locationModule = loadLocationModule();

interface UseCurrentLocationOptions {
  onLocated?: () => void;
}

export function useCurrentLocation({ onLocated }: UseCurrentLocationOptions = {}) {
  const [mapCamera, setMapCamera] = useState<MapCamera>(JEJU_MAP_CAMERA);
  const [userCoordinate, setUserCoordinate] = useState<LocationCoordinate | null>(null);

  const moveToCurrentLocation = useCallback(async () => {
    if (!locationModule) {
      Alert.alert(
        '위치 기능 준비 중',
        '현재 실행 중인 앱에는 위치 모듈이 포함되어 있지 않아요. 앱을 다시 빌드하면 현재 위치를 사용할 수 있습니다.',
      );
      return;
    }

    const permission = await locationModule.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('위치 권한 필요', '현재 위치를 보려면 위치 권한을 허용해주세요.');
      return;
    }

    try {
      const currentLocation: LocationObject = await locationModule.getCurrentPositionAsync({
        accuracy: locationModule.LocationAccuracy.Balanced,
      });
      const nextCoordinate = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setUserCoordinate(nextCoordinate);
      setMapCamera({
        ...nextCoordinate,
        zoom: 15,
      });
      onLocated?.();
    } catch {
      Alert.alert(
        '현재 위치를 찾지 못했어요',
        '시뮬레이터라면 Features > Location에서 None이 아닌 위치를 선택해주세요.',
      );
    }
  }, [onLocated]);

  return {
    mapCamera,
    moveToCurrentLocation,
    setMapCamera,
    userCoordinate,
  };
}
