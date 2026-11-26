'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Map as MaplibreMap, Marker, NavigationControl, GeolocateControl } from 'maplibre-gl';
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
  height?: string;
  cluster?: boolean;
}

const TYPE_CONFIG: Record<FacilityType, { color: string; icon: string; label: string; size: number }> = {
  emergency: { color: '#ef4444', icon: '🏥', label: 'مستشفى عام / طوارئ', size: 44 },
  insurance: { color: '#8b5cf6', icon: '🛡️', label: 'مستشفى تأمين صحي', size: 36 },
  children: { color: '#3b82f6', icon: '👶', label: 'مستشفى أطفال', size: 36 },
  specialized: { color: '#ec4899', icon: '🤰', label: 'مستشفى تخصصي', size: 36 },
  phc: { color: '#10b981', icon: '🏠', label: 'وحدة رعاية أساسية', size: 36 },
  other: { color: '#6b7280', icon: '🏥', label: 'أخرى', size: 32 },
};

function clusterPoints(
  facilities: Facility[],
  zoom: number
) {
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
    const cellX = Math.floor(lng / gridSize);
    const cellY = Math.floor(lat / gridSize);
    const key = `${cellX},${cellY}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(f);
  });

  const result: Array<{ type: 'cluster' | 'point'; id: string; coordinates: [number, number]; count?: number; facilities?: Facility[] }> = [];
  let clusterId = 0;

  grid.forEach((facs) => {
    if (facs.length === 1) {
      result.push({
        type: 'point',
        id: facs[0].id,
        coordinates: facs[0].geometry.coordinates,
        facilities: facs,
      });
    } else {
      const avgLng = facs.reduce((sum: number, f: Facility) => sum + f.geometry.coordinates[0], 0) / facs.length;
      const avgLat = facs.reduce((sum: number, f: Facility) => sum + f.geometry.coordinates[1], 0) / facs.length;
      result.push({
        type: 'cluster',
        id: `cluster-${clusterId++}`,
        coordinates: [avgLng, avgLat],
        count: facs.length,
        facilities: facs,
      });
    }
  });

  return result;
}

export default function FayoumHealthMap({
  facilities,
  onFacilityClick,
  className,
  height = '70vh',
  cluster = true,
}: FayoumHealthMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const renderMarkers = useCallback(
    (map: MaplibreMap, facs: Facility[]) => {
      const zoom = map.getZoom();
      const clustered = cluster ? clusterPoints(facs, zoom) : facs.map((f) => ({ type: 'point' as const, id: f.id, coordinates: f.geometry.coordinates, facilities: [f] }));

      clustered.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'facility-marker';
        el.style.cursor = 'pointer';

        if (item.type === 'cluster') {
          el.innerHTML = `
            <div style="
              background: rgba(16, 185, 129, 0.9);
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="color: white; font-weight: bold; font-size: 12px;">
                ${item.count}
              </span>
            </div>
          `;
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (item.facilities && item.facilities.length > 0) {
              const first = item.facilities[0];
              map.flyTo({
                center: first.geometry.coordinates,
                zoom: 13,
                duration: 1000,
              });
            }
          });
        } else {
          const f = item.facilities![0];
          const props = f.properties;
          const config = TYPE_CONFIG[props.type];

          el.innerHTML = `
            <div style="
              background: ${config.color};
              width: ${config.size}px;
              height: ${config.size}px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: ${config.size * 0.45}px; line-height: 1;">
                ${config.icon}
              </span>
            </div>
          `;

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo({
              center: f.geometry.coordinates,
              zoom: 15,
              duration: 1000,
            });
            onFacilityClick?.(f);
          });
        }

        const marker = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat(item.coordinates)
          .addTo(map);

        markersRef.current.push(marker);
      });
    },
    [cluster, onFacilityClick]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new MaplibreMap({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [30.84, 29.31],
      zoom: 10,
      attributionControl: false,
    });

    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      }),
      'top-right'
    );

    map.on('load', () => {
      renderMarkers(map, facilities);
    });

    map.on('zoomend', () => {
      if (!cluster) return;
      clearMarkers();
      renderMarkers(map, facilities);
    });

    mapRef.current = map;

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clearMarkers();
    renderMarkers(map, facilities);
  }, [facilities, clearMarkers, renderMarkers]);

  return (
    <div
      ref={mapContainer}
      className={`${className} w-full h-[${height}] rounded-2xl overflow-hidden relative`}
    />
  );
}
