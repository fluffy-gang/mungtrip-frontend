import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Share } from 'react-native';

import { errorMessage } from './validation';

import type { Place } from '../types';
import type { PlaceIntegration } from './environment';
import type { PlaceSource } from './types';

const EMPTY_SAVED = { sessionRevision: 0, placeLikedById: {} as Readonly<Record<number, boolean | undefined>> };
const emptySnapshot = () => EMPTY_SAVED;
const noSubscribe = () => () => {};
export function usePlaceActions(place: Place | undefined, source: PlaceSource, integration: PlaceIntegration) {
  const saved = integration.saved;
  const snapshot = useSyncExternalStore(saved?.subscribe ?? noSubscribe, saved?.getSnapshot ?? emptySnapshot, emptySnapshot);
  const scope = `${place?.id}:${source}:${snapshot.sessionRevision}`;
  const [notice, setNotice] = useState<{ scope: string; value?: string }>();
  const [pending, setPending] = useState<{ scope: string; value: boolean }>();
  const setMessage = (value?: string) => setNotice({ scope, value });
  const setBusy = (value: boolean) => setPending({ scope, value });
  const message = notice?.scope === scope ? notice.value : undefined;
  const busy = pending?.scope === scope && pending.value;
  const locked = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current += 1; locked.current = false;
    return () => { generation.current += 1; };
  }, [place?.id, source, snapshot.sessionRevision]);
  const run = async (action: () => Promise<string | void>) => {
    if (locked.current) return;
    const started = generation.current;
    locked.current = true; setBusy(true); setMessage(undefined);
    try { const result = await action(); if (started === generation.current && result) setMessage(result); }
    catch (cause) { if (started === generation.current) setMessage(errorMessage(cause)); }
    finally { if (started === generation.current) { locked.current = false; setBusy(false); } }
  };
  const canSave = Boolean(saved && saved.source === source);
  return {
    message, setMessage, busy, canSave,
    liked: place ? (canSave ? snapshot.placeLikedById[place.id] : undefined) ?? place.isLiked : false,
    canTrip: Boolean(integration.onAddToTrip),
    toggle: () => run(async () => { if (place && saved && canSave) await saved.togglePlaceLike(place.id); }),
    trip: () => run(async () => {
      if (!place || !integration.onAddToTrip) return;
      const result = await integration.onAddToTrip({ mode: 'add', source,
        selection: { kind: 'place', places: [{ id: place.id, name: place.name, thumbnailUrl: place.imageUrl }] } });
      if (result === 'completed') return '내 여행에 추가했어요.';
    }),
    share: () => run(async () => { if (place) await Share.share({ message: [place.name, place.address].filter(Boolean).join('\n') }); }),
  };
}
