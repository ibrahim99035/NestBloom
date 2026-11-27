'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  Map as MaplibreMap,
  Marker,
  NavigationControl,
  GeolocateControl,
  setWorkerUrl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export type FacilityType =
  | 'emergency'
  | 'insurance'
  | 'children'
  | 'specialized'
  | 'phc'
  | 'other';

export interface FacilityProperties {
  id: string;
  name_ar: string;
  name_en?: string;
  type: FacilityType;
  phone?: string;
  emergency?: string | boolean;
  services?: string;
  address?: string;
  openingHours?: string;
}

export interface Facility {
  id: string;
  properties: FacilityProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface FayoumHealthMapProps {
  facilities: Facility[];
  onFacilityClick?: (facility: Facility) => void;
  className?: string;
  height?: number | string;
  cluster?: boolean;
}

const FAYOUM_CENTER: [number, number] = [30.84, 29.31];

const TYPE_CONFIG: Record<FacilityType, { color: string; icon: string; size: number }> = {
  emergency: { color: '#ef4444', icon: '🏥', size: 40 },
  insurance: { color: '#8b5cf6', icon: '🛡️', size: 34 },
  children: { color: '#3b82f6', icon: '👶', size: 34 },
  specialized: { color: '#ec4899', icon: '🤰', size: 34 },
  phc: { color: '#10b981', icon: '🏠', size: 34 },
  other: { color: '#6b7280', icon: '🏥', size: 30 },
};

type ClusterItem =
  | { type: 'point'; id: string; coordinates: [number, number]; facilities: Facility[] }
  | { type: 'cluster'; id: string; coordinates: [number, number]; count: number; facilities: Facility[] };

function clusterPoints(facilities: Facility[], zoom: number): ClusterItem[] {
  if (zoom >= 12) {
    return facilities.map((f) => ({
      type: 'point' as const,
      id: f.id,
      coordinates: f.geometry.coordinates,
      facilities: [f],
    }));
  }

  const gridSize = zoom >= 10 ? 0.02 : zoom >= 8 ? 0.05 : 0.1;
  const grid = new Map<string, Facility[]>();

  facilities.forEach((f) => {
    const [lng, lat] = f.geometry.coordinates;
    const key = `${Math.floor(lng / gridSize)},${Math.floor(lat / gridSize)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(f);
  });

  const result: ClusterItem[] = [];
  let clusterId = 0;

  grid.forEach((facs) => {
    if (facs.length === 1) {
      result.push({
        type: 'point',
        id: facs[0].id,
        coordinates: facs[0].geometry.coordinates,
        facilities: facs,
      });
      return;
    }

    const avgLng = facs.reduce((sum, f) => sum + f.geometry.coordinates[0], 0) / facs.length;
    const avgLat = facs.reduce((sum, f) => sum + f.geometry.coordinates[1], 0) / facs.length;
    result.push({
      type: 'cluster',
      id: `cluster-${clusterId++}`,
      coordinates: [avgLng, avgLat],
      count: facs.length,
      facilities: facs,
    });
  });

  return result;
}

export default function FayoumHealthMap({
  facilities,
  onFacilityClick,
  className,
  height = '100%',
  cluster = true,
}: FayoumHealthMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const isLoadedRef = useRef(false);

  // Keep the latest props available to stable callbacks without re-creating the map.
  const facilitiesRef = useRef(facilities);
  const clusterRef = useRef(cluster);
  const onFacilityClickRef = useRef(onFacilityClick);
  facilitiesRef.current = facilities;
  clusterRef.current = cluster;
  onFacilityClickRef.current = onFacilityClick;

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const facs = facilitiesRef.current;
    const items = clusterRef.current
      ? clusterPoints(facs, map.getZoom())
      : facs.map<ClusterItem>((f) => ({
          type: 'point',
          id: f.id,
          coordinates: f.geometry.coordinates,
          facilities: [f],
        }));

    items.forEach((item) => {
      const el = document.createElement('div');
      el.style.cursor = 'pointer';

      if (item.type === 'cluster') {
        el.innerHTML = `
          <div style="
            background: rgba(16, 185, 129, 0.95);
            width: 36px; height: 36px; border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 700; font-size: 13px;
            font-family: system-ui, sans-serif;
          ">${item.count}</div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const first = item.facilities[0];
          if (!first) return;
          map.flyTo({ center: first.geometry.coordinates, zoom: 13, duration: 800 });
        });
      } else {
        const f = item.facilities[0];
        const config = TYPE_CONFIG[f.properties.type] ?? TYPE_CONFIG.other;
        el.innerHTML = `
          <div style="
            background: ${config.color};
            width: ${config.size}px; height: ${config.size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: ${Math.round(config.size * 0.45)}px; line-height: 1;">
              ${config.icon}
            </span>
          </div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          map.flyTo({ center: f.geometry.coordinates, zoom: 15, duration: 800 });
          onFacilityClickRef.current?.(f);
        });
      }

      const marker = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat(item.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  // Create the map exactly once.
  useEffect(() => {
    const container = mapContainer.current;
    if (!container || mapRef.current) return;

    // MapLibre resolves its worker with `new URL('./maplibre-gl-worker.mjs',
    // import.meta.url)`. Turbopack rewrites that to a chunk that does not
    // exist, so the worker fails to load and no tiles ever render. Point it at
    // a copy of the worker served from /public instead.
    setWorkerUrl('/maplibre-gl-worker.mjs');

    const map = new MaplibreMap({
      container,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: FAYOUM_CENTER,
      zoom: 10,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      }),
      'top-right'
    );

    map.on('load', () => {
      isLoadedRef.current = true;
      renderMarkers();
    });

    map.on('zoomend', () => {
      if (!clusterRef.current) return;
      clearMarkers();
      renderMarkers();
    });

    map.on('error', (e) => {
      console.warn('Map error:', e?.error?.message ?? e);
    });

    // Keep the canvas sized to its container (the map is often inside
    // flex/grid layouts that change size after mount).
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      clearMarkers();
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, [clearMarkers, renderMarkers]);

  // Re-render markers when facilities or filters change.
  useEffect(() => {
    clearMarkers();
    if (isLoadedRef.current) renderMarkers();
  }, [facilities, clearMarkers, renderMarkers]);

  return (
    <div
      ref={mapContainer}
      className={`w-full rounded-2xl overflow-hidden relative bg-[#eef2f1] ${className ?? ''}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: 240 }}
    />
  );
}
