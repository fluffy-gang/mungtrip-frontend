import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';

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
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

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

export function GoogleGISButton({ disabled = false, onCredential, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const clientId = Constants.expoConfig?.extra?.oauth?.googleWebClientId as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    void loadGoogleGIS().then(() => {
      if (!active || !ref.current) return;
      const gis = window.google;
      if (!gis) {
        onError(new Error('Google 로그인 라이브러리가 초기화되지 않았어요.'));
        return;
      }
      try {
        gis.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (!credential) {
              onError(new Error('Google에서 ID token을 받지 못했어요. 다시 시도해주세요.'));
              return;
            }
            onCredential(credential);
          },
        });
        ref.current.replaceChildren();
        gis.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: '440',
        });
      } catch (error) {
        onError(error);
      }
    }).catch((error: unknown) => {
      if (active) onError(error);
    });
    return () => { active = false; };
  }, [clientId, onCredential, onError]);

  if (!clientId) return <div role="status">Google 로그인을 사용할 수 없어요. OAuth Client ID 설정이 필요해요.</div>;
  return <div aria-disabled={disabled} ref={ref} style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined} />;
}
