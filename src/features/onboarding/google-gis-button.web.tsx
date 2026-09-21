import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Constants from 'expo-constants';

import { Text } from '@/components/ui/text';

import { styles } from './screens/login/style';

interface Props {
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (error: unknown) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
  }
}

const googleIcon = require('../../../assets/images/onboarding/google-icon.png');

let scriptLoad: Promise<void> | undefined;

function loadGoogleGIS() {
  if (window.google) return Promise.resolve();
  if (scriptLoad) return scriptLoad;

  scriptLoad = new Promise<void>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>('script[data-google-gis]');
    let created = false;
    if (script?.dataset.gisLoaded === 'true') {
      reject(new Error('Google 로그인을 초기화하지 못했어요. 페이지를 새로고침해주세요.'));
      return;
    }
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.dataset.googleGis = 'true';
      created = true;
    }
    const activeScript = script;
    if (!activeScript) {
      reject(new Error('Google 로그인 라이브러리를 불러오지 못했어요.'));
      return;
    }

    const onLoad = () => {
      activeScript.dataset.gisLoaded = 'true';
      cleanup();
      if (window.google) resolve();
      else reject(new Error('Google 로그인 라이브러리가 초기화되지 않았어요.'));
    };
    const onError = () => {
      cleanup();
      activeScript.remove();
      reject(new Error('Google 로그인 라이브러리를 불러오지 못했어요. 네트워크를 확인하고 다시 시도해주세요.'));
    };
    const cleanup = () => {
      activeScript.removeEventListener('load', onLoad);
      activeScript.removeEventListener('error', onError);
    };

    activeScript.addEventListener('load', onLoad, { once: true });
    activeScript.addEventListener('error', onError, { once: true });
    if (created) document.head.append(activeScript);
  }).catch((error: unknown) => {
    scriptLoad = undefined;
    throw error;
  });
  return scriptLoad;
}

export function GoogleGISButton({ disabled, onCredential, onError }: Props) {
  const clientId = (Constants.expoConfig?.extra?.oauth?.googleWebClientId as string | undefined)
    ?? process.env.EXPO_PUBLIC_OAUTH_GOOGLE_WEB_CLIENT_ID?.trim();
  const [ready, setReady] = useState(false);
  const [selectingAccount, setSelectingAccount] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    void loadGoogleGIS().then(() => {
      if (!active) return;
      const gis = window.google;
      if (!gis) {
        onError(new Error('Google 로그인 라이브러리가 초기화되지 않았어요.'));
        return;
      }
      gis.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (!credential) {
            setSelectingAccount(false);
            onError(new Error('Google에서 ID token을 받지 못했어요. 다시 시도해주세요.'));
            return;
          }
          onCredential(credential);
        },
      });
      setReady(true);
    }).catch((error: unknown) => {
      if (active) onError(error);
    });
    return () => { active = false; };
  }, [clientId, onCredential, onError]);

  const handlePress = () => {
    const gis = window.google;
    if (!gis) {
      onError(new Error('Google 로그인 라이브러리가 초기화되지 않았어요.'));
      return;
    }
    setSelectingAccount(true);
    try {
      gis.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setSelectingAccount(false);
          onError(new Error('Google 로그인 창이 표시되지 않았어요. 팝업 차단을 해제하고 다시 시도해주세요.'));
        }
      });
    } catch (error) {
      setSelectingAccount(false);
      onError(error);
    }
  };

  if (!clientId) return <Text color="textTertiary" fontSize={12}>Google 로그인을 사용할 수 없어요. OAuth Client ID 설정이 필요해요.</Text>;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || !ready || selectingAccount}
      onPress={handlePress}
      style={({ pressed }) => [styles.socialButton, styles.googleButton, pressed && styles.pressed]}
    >
      <Image contentFit="contain" source={googleIcon} style={styles.socialIcon} />
      <Text fontSize={16} fontWeight="bold" lineHeight={24}>Google로 시작하기</Text>
    </Pressable>
  );
}
