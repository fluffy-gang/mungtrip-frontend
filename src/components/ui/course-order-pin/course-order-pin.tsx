import { PinImage, PinLabel, PinRoot } from './style';

import type { CourseOrderPinProps } from './type';

const listPin = require('../../../../assets/images/course-detail/course-pin-list.svg');
const mapPin = require('../../../../assets/images/course-detail/course-pin-map.svg');

/** 지도 요약과 코스 타임라인이 공유하는 발바닥 순서 핀이다. */
export function CourseOrderPin({
  order,
  variant = 'list',
}: CourseOrderPinProps) {
  return (
    <PinRoot $variant={variant} accessibilityLabel={`${order}번째 장소`}>
      <PinImage
        contentFit="contain"
        source={variant === 'map' ? mapPin : listPin}
      />
      <PinLabel $variant={variant}>{order}</PinLabel>
    </PinRoot>
  );
}
