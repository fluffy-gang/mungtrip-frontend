import { dateCount } from './date-utils';
import { array, count, dates, object, optionalNumber, optionalText, parseTrip, positive, text, titleValue, uniqueIds, validateCreate } from './validation';

import type { TripAdapter, TripBrief, TripPlaceSelection, TripSearchResult, TripSummary, TripTransport } from './types';
const ROOT = '/api/v1/trips';
const PLACES = '/api/v1/places';
/** A lost write response may already have persisted; callers must not blindly replay it. */
export class TripWriteUncertainError extends Error {
  constructor() { super('요청의 처리 결과를 확인할 수 없어요. 여행 목록을 새로고침해 확인해 주세요.'); this.name = 'TripWriteUncertainError'; }
}
export const parsePlace = (value: unknown): TripPlaceSelection => {
  const item = object(value);
  return {
    id: positive(item.id), name: text(item.name), thumbnailUrl: optionalText(item.thumbnailUrl) ?? (item.images == null ? undefined : array(item.images).map(text)[0]),
    category: optionalText(item.category), address: optionalText(item.address), latitude: optionalNumber(item.mapy),
    longitude: optionalNumber(item.mapx), distanceMeters: item.distanceMeters == null ? undefined : count(item.distanceMeters),
    tags: item.tags == null ? undefined : array(item.tags).map(text),
    isOfficial: typeof item.isOfficial === 'boolean' ? item.isOfficial : undefined,
    averageRating: optionalNumber(item.averageRating),
    visitCount: item.visitCount == null && item.visitedCount == null ? undefined : count(item.visitCount ?? item.visitedCount)
  };
};
const parseSearch = (value: unknown): TripSearchResult => {
  const item = object(value);
  return { places: array(item.places).map(parsePlace), page: count(item.page), size: positive(item.size), totalCount: count(item.totalCount) };
};
const parseBrief = (value: unknown): TripBrief => {
  const item = object(value), range = dates(item.startDate, item.endDate);
  const totalDays = positive(item.totalDays);
  if (totalDays !== dateCount(range.startDate, range.endDate))
    throw new Error('여행 기간과 일차가 일치하지 않습니다.');
  return { tripId: positive(item.tripId), title: text(item.title), ...range, totalDays };
};
const parseSummary = (value: unknown): TripSummary => {
  const item = object(value);
  const totalPlaceCount = count(item.totalPlaceCount), visitedPlaceCount = count(item.visitedPlaceCount);
  if (visitedPlaceCount > totalPlaceCount)
    throw new Error('방문 개수가 올바르지 않습니다.');
  return {
    tripId: positive(item.tripId), title: text(item.title), ...dates(item.startDate, item.endDate),
    thumbnailUrls: array(item.thumbnailUrls).map(text), totalPlaceCount, visitedPlaceCount
  };
};
/** Transport data is already unwrapped by the shared API client's interceptor. */
export const createTripAdapter = (transport: TripTransport): TripAdapter => {
  const get = (path: string, params?: Record<string, unknown>) => transport.request({ method: 'GET', path, params });
  const write = async (method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<unknown> => {
    try {
      return await transport.request({ method, path, body });
    }
    catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
      if (typeof status !== 'number' || status >= 500)
        throw new TripWriteUncertainError();
      throw error;
    }
  };
  const add = async (path: string, body: unknown): Promise<number[]> => {
    const result = await write('POST', path, body);
    try {
      return uniqueIds(object(result).tripItemIds, true);
    }
    catch {
      throw new TripWriteUncertainError();
    }
  };
  return {
    list: async () => {
      const result = object(await get(ROOT));
      return { upcomingTrips: array(result.upcomingTrips).map(parseSummary), pastTrips: array(result.pastTrips).map(parseSummary) };
    },
    brief: async () => array(object(await get(`${ROOT}/brief`)).trips).map(parseBrief),
    dogs: async () => array(object(await get('/api/v1/dogs')).dogs).map(raw => {
      const dog = object(raw);
      return { dogId: positive(dog.dogId), name: text(dog.name), profileImageUrl: optionalText(dog.profileImageUrl) };
    }),
    detail: async (id) => {
      const trip = parseTrip(await get(`${ROOT}/${positive(id)}`));
      if (trip.tripId !== id)
        throw new Error('요청한 여행과 응답이 일치하지 않습니다.');
      return trip;
    },
    create: async (input) => {
      const result = await write('POST', ROOT, validateCreate(input));
      try {
        return positive(object(result).tripId);
      }
      catch {
        throw new TripWriteUncertainError();
      }
    },
    addPlaces: (id, ids, day) => add(`${ROOT}/${positive(id)}/items/place`, { placeIds: uniqueIds(ids, true), day: positive(day) }),
    addCourse: (id, courseId, day) => add(`${ROOT}/${positive(id)}/items/course`, { courseId: positive(courseId), day: positive(day) }),
    update: async (id, title, items) => {
      uniqueIds(items.map(item => item.tripItemId));
      items.forEach(item => { positive(item.day); positive(item.sortOrder); });
      await write('PUT', `${ROOT}/${positive(id)}`, { title: titleValue(title), items });
    },
    remove: async (id) => { await write('DELETE', `${ROOT}/${positive(id)}`); },
    search: async (params) => {
      if (!params.keyword?.trim() && ![params.swLng, params.swLat, params.neLng, params.neLat].every(value => typeof value === 'number' && Number.isFinite(value)))
        throw new Error('검색어나 지도 범위가 필요합니다.');
      if (params.page !== undefined)
        count(params.page);
      if (params.size !== undefined)
        positive(params.size);
      return parseSearch(await get(PLACES, { ...params }));
    },
    recommendations: async (category) => parseSearch(await get(`${PLACES}/recommendations`, { category })),
    recent: async (category) => parseSearch(await get(`${PLACES}/me/recent-views`, { category })),
    nearby: async (id) => {
      const result = object(await get(`${PLACES}/${positive(id)}/nearby`));
      return {
        places: array(result.places).map(parsePlace),
        expandedRadiusMeters: result.expandedRadiusMeters == null ? null : count(result.expandedRadiusMeters),
        expandedCount: result.expandedCount == null ? null : count(result.expandedCount)
      };
    },
    place: async (id) => {
      const place = parsePlace(await get(`${PLACES}/${positive(id)}`));
      if (place.id !== id)
        throw new Error('장소 응답이 일치하지 않습니다.');
      return place;
    },
  };
};
