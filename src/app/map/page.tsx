'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFacilitiesStore } from '@/stores/useFacilitiesStore';
import FayoumHealthMap from '@/components/FayoumHealthMap';
import FacilityBottomSheet from '@/components/FacilityBottomSheet';
import FacilityFilterChips from '@/components/FacilityFilterChips';

export default function MapPage() {
  const {
    isLoading,
    setFacilities,
    setLoading,
    filteredFacilities,
  } = useFacilitiesStore();
  const [selectedFacility, setSelectedFacility] = useState<ReturnType<typeof filteredFacilities>[number] | null>(null);

  // Load facilities exactly once (guarded by the store).
  useEffect(() => {
    if (useFacilitiesStore.getState().facilities.length > 0) return;
    let cancelled = false;

    setLoading(true);
    fetch('/data/fayoum-facilities.geojson')
      .then((res) => res.json())
      .then((geojson: any) => {
        if (cancelled) return;
        const facs = geojson.features.map((f: any) => ({
          id: f.properties.id,
          properties: f.properties,
          geometry: f.geometry,
        }));
        setFacilities(facs);
      })
      .catch((err) => console.error('Failed to load facilities:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setFacilities, setLoading]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 dir-rtl">
      <nav className="mb-6">
        <Link
          href="/"
          className="text-slate-500 hover:text-emerald-600 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى الرئيسية
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          خريطة المرافق الصحية — الفيوم
        </h1>

        <FacilityFilterChips />

        <div className="mt-4 bg-white rounded-3xl shadow-sm border border-[#f3e8dd] overflow-hidden">
          <div className="h-[60vh] min-h-[420px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                تحميل الخريطة…
              </div>
            ) : (
              <FayoumHealthMap
                facilities={filteredFacilities()}
                onFacilityClick={(f) => setSelectedFacility(f)}
                cluster={true}
                height="100%"
              />
            )}
          </div>
        </div>

        <FacilityBottomSheet
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      </div>
    </div>
  );
}
