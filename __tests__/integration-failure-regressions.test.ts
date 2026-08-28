import { toApiError } from '@/shared/api/error';

const axiosError = (options: {
  code?: string;
  message: string;
  status?: number;
}) => ({
  code: options.code,
  isAxiosError: true,
  message: options.message,
  response:
    options.status === undefined
      ? undefined
      : {
          data: { message: options.message },
          status: options.status,
        },
});

describe('integration failure regressions', () => {
  it.each([
    [
      'offline',
      axiosError({ code: 'ERR_NETWORK', message: 'Network Error' }),
      undefined,
      '요청 처리 중 문제가 발생했습니다.',
    ],
    [
      'timeout',
      axiosError({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' }),
      undefined,
      '요청 처리 중 문제가 발생했습니다.',
    ],
    ['4xx', axiosError({ message: '요청 오류', status: 400 }), 400, '요청 오류'],
    ['5xx', axiosError({ message: '서버 오류', status: 503 }), 503, '서버 오류'],
  ])('%s 오류를 재시도 가능한 API 오류로 보존한다', (_name, source, status, message) => {
    const error = toApiError(source);

    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(status);
    expect(error.message).toBe(message);
  });

  it('지도 네이티브 모듈 로드 실패를 목록용 fallback으로 변환한다', () => {
    const previousClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
    process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID = 'public-client-id';
    jest.resetModules();
    jest.doMock('@mj-studio/react-native-naver-map', () => {
      throw new Error('native module unavailable');
    });

    jest.isolateModules(() => {
      const nativeModules = require('@/features/home/utils/native-modules') as {
        isNativeMapAvailable: boolean;
        loadNativeMapModule: () => unknown;
      };

      expect(nativeModules.isNativeMapAvailable).toBe(false);
      expect(nativeModules.loadNativeMapModule()).toBeNull();
    });

    jest.dontMock('@mj-studio/react-native-naver-map');
    jest.resetModules();
    if (previousClientId === undefined) {
      delete process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
    } else {
      process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID = previousClientId;
    }
  });
});
