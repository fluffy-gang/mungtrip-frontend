import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { resolveAssetUri } from '@/utils/asset';
import { getPlaceCategoryMeta } from '../constants';
import { styles as homeStyles } from '../styles';
import { colors } from '../styles/style-primitives';
import { hasPlaceCoordinate } from '../utils/place-utils';

import type { MapCanvasProps } from './map-canvas.types';
import type { MapBounds } from '../types';
import type { Place } from '@/features/places/types';

interface LatLng {
  lat(): number;
  lng(): number;
}

interface NaverMap {
  getBounds(): { getSW(): LatLng; getNE(): LatLng };
  getCenter(): LatLng;
  getZoom(): number;
  setCenter(position: LatLng): void;
  setZoom(zoom: number): void;
}

interface NaverNamespace {
  maps: {
    Event: {
      addListener(target: object, name: string, callback: () => void): object;
      removeListener(listener: object): void;
    };
    LatLng: new (latitude: number, longitude: number) => LatLng;
    Map: new (element: HTMLElement, options: { center: LatLng; zoom: number; scaleControl: boolean; zoomControl: boolean }) => NaverMap;
    Marker: new (options: { map: NaverMap; position: LatLng; title?: string; icon?: { content: string; anchor: object } }) => { setMap(map: NaverMap | null): void };
    Point: new (x: number, y: number) => object;
  };
}

let apiPromise: Promise<NaverNamespace> | undefined;

function loadNaverMapsApi(clientId: string) {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const existingApi = (window as Window & { naver?: NaverNamespace }).naver;
    if (existingApi?.maps) return resolve(existingApi);

    let script = document.querySelector<HTMLScriptElement>('script[data-naver-maps]');
    const onLoad = () => {
      const api = (window as Window & { naver?: NaverNamespace }).naver;
      if (api?.maps) resolve(api);
      else reject(new Error('NAVER Maps API did not initialize'));
    };
    if (!script) {
      script = document.createElement('script');
      script.dataset.naverMaps = 'true';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
      script.async = true;
      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', () => reject(new Error('NAVER Maps API failed to load')), { once: true });
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', () => reject(new Error('NAVER Maps API failed to load')), { once: true });
    }
  });
  return apiPromise;
}

function boundsFromMap(map: NaverMap): MapBounds {
  const bounds = map.getBounds();
  const southWest = bounds.getSW();
  const northEast = bounds.getNE();
  return { swLng: southWest.lng(), swLat: southWest.lat(), neLng: northEast.lng(), neLat: northEast.lat() };
}

function markerIcon(place: Place, selected: boolean, dimmed: boolean, api: NaverNamespace) {
  const meta = getPlaceCategoryMeta(place.category);
  const icon = meta.kind === 'image' ? resolveAssetUri(meta.icon) : undefined;
  const content = `<div style="width:32px;height:32px;border-radius:50%;border:2px solid white;background:${selected ? '#000' : dimmed ? '#F1F5F9' : colors.primary};box-shadow:0 1px 6px #0005;display:grid;place-items:center">${icon ? `<img src="${icon}" style="width:20px;height:20px;object-fit:contain;${dimmed ? 'opacity:.5;' : ''}" />` : `<span style="color:white;font-size:18px">•</span>`}</div>`;
  return { content, anchor: new api.maps.Point(18, 36) };
}

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

export function MapCanvas({
  mapCamera, onSelectPlace, places, selectedCategory, selectedPlaceId,
  setMapBounds, setMapCamera, userCoordinate, userProfileImageUrl,
}: MapCanvasProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NaverMap | null>(null);
  const cameraRef = useRef(mapCamera);
  const callbacksRef = useRef({ setMapBounds, setMapCamera });
  const [api, setApi] = useState<NaverNamespace | null>(null);
  const [error, setError] = useState('');
  const clientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim();
  const visiblePlaces = useMemo(() => places.filter(hasPlaceCoordinate).slice(0, 50), [places]);

  useEffect(() => {
    cameraRef.current = mapCamera;
    callbacksRef.current = { setMapBounds, setMapCamera };
  }, [mapCamera, setMapBounds, setMapCamera]);

  useEffect(() => {
    if (!clientId || !elementRef.current) return;
    let active = true;
    let eventApi: NaverNamespace | null = null;
    let idleListener: object | null = null;
    loadNaverMapsApi(clientId).then((naver) => {
      if (!active || !elementRef.current) return;
      const map = new naver.maps.Map(elementRef.current, {
        center: new naver.maps.LatLng(cameraRef.current.latitude, cameraRef.current.longitude),
        zoom: cameraRef.current.zoom,
        scaleControl: false,
        zoomControl: false,
      });
      eventApi = naver;
      mapRef.current = map;
      setApi(naver);
      const updateViewport = () => {
        const center = map.getCenter();
        callbacksRef.current.setMapCamera({ latitude: center.lat(), longitude: center.lng(), zoom: map.getZoom() });
        callbacksRef.current.setMapBounds(boundsFromMap(map));
      };
      idleListener = naver.maps.Event.addListener(map, 'idle', updateViewport);
      updateViewport();
    }).catch(() => setError('네이버 지도 API를 불러오지 못했어요.'));
    return () => {
      active = false;
      if (eventApi && idleListener) eventApi.maps.Event.removeListener(idleListener);
      mapRef.current = null;
      setApi(null);
    };
  }, [clientId]);

  useEffect(() => {
    const map = mapRef.current;
    const naver = api;
    if (!map || !naver) return;
    const center = map.getCenter();
    if (Math.abs(center.lat() - mapCamera.latitude) > 0.000001 || Math.abs(center.lng() - mapCamera.longitude) > 0.000001) {
      map.setCenter(new naver.maps.LatLng(mapCamera.latitude, mapCamera.longitude));
    }
    if (map.getZoom() !== mapCamera.zoom) map.setZoom(mapCamera.zoom);
  }, [api, mapCamera.latitude, mapCamera.longitude, mapCamera.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !api) return;
    const markers: { setMap(map: NaverMap | null): void }[] = [];
    const listeners: object[] = [];
    for (const place of visiblePlaces) {
      const selected = place.id === selectedPlaceId;
      const dimmed = Boolean(selectedCategory && place.category !== selectedCategory.code && !selected);
      const marker = new api.maps.Marker({
        map,
        position: new api.maps.LatLng(place.latitude, place.longitude),
        title: place.name,
        icon: markerIcon(place, selected, dimmed, api),
      });
      listeners.push(api.maps.Event.addListener(marker, 'click', () => onSelectPlace(place)));
      markers.push(marker);
    }
    if (userCoordinate) {
      const image = userProfileImageUrl ? `<img src="${escapeAttribute(userProfileImageUrl)}" style="width:34px;height:34px;border-radius:50%;object-fit:cover" />` : '<span style="width:10px;height:10px;background:#1C7CFE;border-radius:50%"></span>';
      markers.push(new api.maps.Marker({
        map,
        position: new api.maps.LatLng(userCoordinate.latitude, userCoordinate.longitude),
        title: '내 위치',
        icon: { content: `<div style="width:38px;height:38px;border-radius:50%;border:2px solid #1C7CFE;background:white;display:grid;place-items:center">${image}</div>`, anchor: new api.maps.Point(19, 19) },
      }));
    }
    return () => {
      listeners.forEach(listener => api.maps.Event.removeListener(listener));
      markers.forEach(marker => marker.setMap(null));
    };
  }, [api, onSelectPlace, selectedCategory, selectedPlaceId, userCoordinate, userProfileImageUrl, visiblePlaces]);

  return (
    <View style={homeStyles.mapLayer}>
      {clientId ? <div ref={elementRef} style={webStyles.map} /> : null}
      {(!clientId || error) ? (
        <View style={webStyles.unavailable}>
          <Text style={webStyles.message}>{error || '지도 표시에는 EXPO_PUBLIC_NAVER_MAP_CLIENT_ID 설정이 필요해요.'}</Text>
        </View>
      ) : null}
    </View>
  );
}

const webStyles = StyleSheet.create({
  map: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  unavailable: { ...StyleSheet.absoluteFill, alignItems: 'center', backgroundColor: '#F2F4F6', justifyContent: 'center', padding: 24 },
  message: { color: '#6B7684', fontSize: 14, textAlign: 'center' },
});
