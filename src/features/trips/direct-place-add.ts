import { createTripFlowController } from './flow';
import { TripSessionChangedError } from './provider';
import { positive } from './validation';

import type { TripPlaceSelection, TripProvider } from './types';

/**
 * 지정된 여행·일차에만 장소를 추가한다. 여행 선택 바텀시트를 거치지 않는 경로이므로
 * 대상은 생성 시점에 고정되고, 세션이 바뀌면 쓰기를 시작하지 않는다.
 * 확정된 성공과 저장 여부가 불확실한 실패는 같은 화면에서 재전송하지 않는다.
 */
export function createDirectPlaceAddController(provider: TripProvider, tripId: number, day: number) {
  const session = provider.getSnapshot().sessionRevision;
  let flow: ReturnType<typeof createTripFlowController> | undefined;
  let completed = false;
  return {
    get busy() { return flow?.busy ?? false; },
    get uncertain() { return flow?.uncertain ?? false; },
    async submit(places: TripPlaceSelection[]) {
      if (session !== provider.getSnapshot().sessionRevision) throw new TripSessionChangedError();
      positive(tripId);
      positive(day);
      // 진행 중·불확실·완료 상태의 컨트롤러는 그대로 재사용해 중복 쓰기를 막고,
      // 명확한 실패 뒤에만 현재 선택으로 다시 만들어 재시도를 허용한다.
      const reusable = flow && (flow.busy || flow.uncertain || completed) ? flow : undefined;
      if (!reusable && !places.length) throw new Error('장소를 선택해 주세요.');
      const controller = reusable ?? createTripFlowController(provider, {
        mode: 'add', source: provider.source, tripId, day,
        selection: { kind: 'place', places: [...places] },
      });
      flow = controller;
      const result = await controller.submit({});
      completed = true;
      return result;
    },
  };
}
