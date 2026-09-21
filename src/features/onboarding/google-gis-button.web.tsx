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

interface GsiPromptNotification {
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void; use_fedcm_for_prompt?: boolean }) => void;
          prompt: (callback?: (notification: GsiPromptNotification) => void) => void;
        };
      };
    };
  }
}

/** FedCM은 계정 미로그인/오리진 미등록도 '표시 안 됨'으로 합쳐 보고한다. 원인별로 안내를 구분한다. */
function promptFailureMessage(notification: GsiPromptNotification): string {
  const reason = notification.isNotDisplayed() ? notification.getNotDisplayedReason() : notification.getSkippedReason();
  if (reason === 'opt_out_or_no_session') return '이 브라우저에 로그인된 Google 계정이 없어요. accounts.google.com에서 Google 계정으로 로그인한 후 다시 시도해주세요.';
  if (reason === 'unregistered_origin' || reason === 'invalid_client') return 'Google 로그인이 이 주소에서 허용되지 않았어요. 잠시 후 다시 시도하거나 관리자에게 알려주세요.';
  if (reason === 'suppressed_by_user') return 'Google 로그인 창을 다시 표시하려면 브라우저 설정에서 이 사이트의 로그인 알림을 허용해주세요.';
  return `Google 로그인 창이 표시되지 않았어요. 팝업 차단을 해제하고 다시 시도해주세요. (${reason})`;
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
        // Chrome이 One Tap을 FedCM으로 강제 전환하는 중이라 명시적으로 켠다.
        // https://developers.google.com/identity/gsi/web/guides/fedcm-migration
        use_fedcm_for_prompt: true,
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
          onError(new Error(promptFailureMessage(notification)));
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
