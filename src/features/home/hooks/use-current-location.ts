import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { isWithinJejuMapBounds, JEJU_MAP_CAMERA } from '../constants';
import { loadLocationModule } from '../utils/native-modules';

import type { LocationCoordinate, MapCamera } from '../types';
import type { LocationObject } from 'expo-location';

const locationModule = loadLocationModule();

interface UseCurrentLocationOptions {
  onLocated?: () => void;
}

export function useCurrentLocation({ onLocated }: UseCurrentLocationOptions = {}) {
  const [mapCamera, setMapCamera] = useState<MapCamera>(JEJU_MAP_CAMERA);
  const [userCoordinate, setUserCoordinate] = useState<LocationCoordinate | null>(null);

  const applyLocation = useCallback((location: LocationObject) => {
    const nextCoordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    if (!isWithinJejuMapBounds(nextCoordinate.latitude, nextCoordinate.longitude)) {
      setUserCoordinate(null);
      setMapCamera(JEJU_MAP_CAMERA);
      return false;
    }

    setUserCoordinate(nextCoordinate);
    setMapCamera({ ...nextCoordinate, zoom: 15 });
    return true;
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!locationModule) return;

    void locationModule
      .getForegroundPermissionsAsync()
      .then(async permission => {
        if (!isMounted || permission.status !== 'granted') return;

        const currentLocation = await locationModule.getCurrentPositionAsync({
          accuracy: locationModule.LocationAccuracy.Balanced,
        });
        if (isMounted) applyLocation(currentLocation);
      })
      .catch(() => {
        // 자동 위치 확인 실패 시 기본 제주 시청 카메라를 그대로 유지한다.
      });

    return () => {
      isMounted = false;
    };
  }, [applyLocation]);

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
      const isInJeju = applyLocation(currentLocation);
      if (!isInJeju) {
        Alert.alert('서비스 지역 안내', '현재 위치가 제주 지역 밖이라 제주 시청을 보여드려요.');
      } else {
        onLocated?.();
      }
    } catch {
      Alert.alert(
        '현재 위치를 찾지 못했어요',
        '시뮬레이터라면 Features > Location에서 None이 아닌 위치를 선택해주세요.',
      );
    }
  }, [applyLocation, onLocated]);

  return {
    mapCamera,
    moveToCurrentLocation,
    setMapCamera,
    userCoordinate,
  };
}
