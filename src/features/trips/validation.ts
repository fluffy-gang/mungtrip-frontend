import { addDays, dateCount, isValidDate } from './date-utils';

import type { Trip, TripCreateInput, TripPosition } from './types';
export const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('응답 형식이 올바르지 않습니다.');
  return value as Record<string, unknown>;
};
export const array = (value: unknown): unknown[] => {
  if (!Array.isArray(value))
    throw new Error('응답 목록이 누락되었거나 올바르지 않습니다.');
  return value;
};
export const positive = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1)
    throw new Error('식별자 또는 순서가 올바르지 않습니다.');
  return value;
};
export const count = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw new Error('개수가 올바르지 않습니다.');
  return value;
};
export const text = (value: unknown): string => {
  if (typeof value !== 'string')
    throw new Error('문자 응답이 올바르지 않습니다.');
  return value;
};
export const optionalText = (value: unknown): string | undefined => value == null ? undefined : text(value);
export const optionalNumber = (value: unknown): number | undefined => {
  if (value == null)
    return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('수치 응답이 올바르지 않습니다.');
  return value;
};
export const uniqueIds = (values: unknown, nonempty = false): number[] => {
  const ids = array(values).map(positive);
  if ((nonempty && !ids.length) || new Set(ids).size !== ids.length)
    throw new Error('선택 항목이 비어 있거나 중복되었습니다.');
  return ids;
};
export const dates = (start: unknown, end: unknown): {
  startDate: string;
  endDate: string;
} => {
  const startDate = text(start), endDate = text(end);
  if (!dateCount(startDate, endDate))
    throw new Error('여행 날짜 범위가 올바르지 않습니다.');
  return { startDate, endDate };
};
export const titleValue = (value: string): string => {
  if (!value.trim() || value.length > 100)
    throw new Error('여행 이름을 1~100자로 입력해 주세요.');
  return value.trim();
};
export const validateCreate = (input: TripCreateInput): TripCreateInput => ({
  title: titleValue(input.title), ...dates(input.startDate, input.endDate), dogIds: uniqueIds(input.dogIds, true),
});
/** Missing days/items are rejected: PUT deletes every omitted item. */
export const parseTrip = (value: unknown): Trip => {
  const source = object(value);
  const range = dates(source.startDate, source.endDate);
  const seen = new Set<number>();
  const days = array(source.days).map(raw => {
    const day = object(raw);
    const number = positive(day.day);
    const date = text(day.date);
    if (!isValidDate(date) || date !== addDays(range.startDate, number - 1))
      throw new Error('여행 일차의 날짜가 일치하지 않습니다.');
    const orders = new Set<number>();
    const items = array(day.items).map(rawItem => {
      const item = object(rawItem);
      const tripItemId = positive(item.tripItemId), sortOrder = positive(item.sortOrder);
      if (seen.has(tripItemId) || orders.has(sortOrder))
        throw new Error('일정 식별자 또는 순서가 중복되었습니다.');
      seen.add(tripItemId);
      orders.add(sortOrder);
      return {
        tripItemId, sortOrder, placeId: positive(item.placeId), placeName: text(item.placeName),
        category: optionalText(item.category), thumbnailUrl: optionalText(item.thumbnailUrl),
        visitStatus: optionalText(item.visitStatus), rejectReason: optionalText(item.rejectReason), rejectDetail: optionalText(item.rejectDetail)
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
    return { day: number, date, items };
  }).sort((a, b) => a.day - b.day);
  if (days.length !== dateCount(range.startDate, range.endDate) || days.some((day, index) => day.day !== index + 1))
    throw new Error('전체 여행 일정이 필요합니다.');
  return { tripId: positive(source.tripId), title: text(source.title), ...range, days };
};
export const positions = (trip: Trip): TripPosition[] => trip.days.flatMap(day => day.items.map(item => ({ tripItemId: item.tripItemId, day: day.day, sortOrder: item.sortOrder })));
export const validatePositions = (trip: Trip, items: TripPosition[]): void => {
  const known = new Set(positions(trip).map(item => item.tripItemId));
  uniqueIds(items.map(item => item.tripItemId));
  const slots = new Set<string>();
  for (const item of items) {
    positive(item.day);
    positive(item.sortOrder);
    const slot = `${item.day}:${item.sortOrder}`;
    if (!known.has(item.tripItemId) || !trip.days.some(day => day.day === item.day) || slots.has(slot))
      throw new Error('일정 위치가 올바르지 않습니다. 다시 불러와 주세요.');
    slots.add(slot);
  }
};
export const editFingerprint = (trip: Trip): string => JSON.stringify([trip.tripId, trip.title, trip.startDate, trip.endDate, positions(trip)]);
