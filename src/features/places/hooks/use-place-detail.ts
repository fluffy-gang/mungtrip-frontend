import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/shared/api/error';

import { getPlaceDetail } from '../api';
import { usePlaceCatalogContext } from '../place-catalog-context';
import type { Place } from '../types';

export type PlaceDetailStatus =
  | 'invalid'
  | 'loading'
  | 'success'
  | 'not-found'
  | 'error';

interface PlaceDetailState {
  place: Place | null;
  placeId: number | null;
  status: PlaceDetailStatus;
}

export const parsePlaceId = (id: string | string[] | undefined): number | null => {
  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) return null;

  const placeId = Number(id);

  return Number.isSafeInteger(placeId) ? placeId : null;
};

export function usePlaceDetail(id: string | string[] | undefined) {
  const placeId = parsePlaceId(id);
  const catalog = usePlaceCatalogContext();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PlaceDetailState>({
    place: null,
    placeId: null,
    status: placeId === null ? 'invalid' : 'loading',
  });

  useEffect(() => {
    if (placeId === null || catalog.loading) return;

    let active = true;
    const placeCatalog = catalog.isLoaded
      ? { categories: catalog.categories, tags: catalog.tags }
      : undefined;

    void getPlaceDetail(placeId, placeCatalog)
      .then(place => {
        if (active) setState({ place, placeId, status: 'success' });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          place: null,
          placeId,
          status:
            error instanceof ApiError && error.status === 404
              ? 'not-found'
              : 'error',
        });
      });

    return () => {
      active = false;
    };
  }, [
    attempt,
    catalog.categories,
    catalog.isLoaded,
    catalog.loading,
    catalog.tags,
    placeId,
  ]);

  const retry = useCallback(() => {
    if (placeId === null) return;

    setState({ place: null, placeId, status: 'loading' });
    setAttempt(value => value + 1);
  }, [placeId]);

  if (placeId === null) {
    return { place: null, retry, status: 'invalid' as const };
  }

  if (state.placeId !== placeId) {
    return { place: null, retry, status: 'loading' as const };
  }

  return { place: state.place, retry, status: state.status };
}
