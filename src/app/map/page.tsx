'use client';

import { useEffect, useState } from 'react';
import { useFacilitiesStore } from '@/stores/useFacilitiesStore';
import FayoumHealthMap from '@/components/FayoumHealthMap';
import FacilityBottomSheet from '@/components/FacilityBottomSheet';
import FacilityFilterChips from '@/components/FacilityFilterChips';

export default function MapPage() {
  const {
    facilities,
    isLoading,
    setFacilities,
    setLoading,
    filteredFacilities,
  } = useFacilitiesStore();
  const [selectedFacility, setSelectedFacility] = useState<ReturnType<typeof filteredFacilities>[number] | null>(null);

  useEffect(() => {
    if (isLoading) return;
    fetch('/data/fayoum-facilities.geojson')
      .then((res) => res.json())
      .then((geojson: any) => {
        const facs = geojson.features.map((f: any) => ({
          id: f.properties.id,
          properties: f.properties,
          geometry: f.geometry,
        }));
        setFacilities(facs);
        setLoading(false);
      });
    setLoading(true);
  }, [setFacilities, setLoading, isLoading]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 dir-rtl">
      <nav className="mb-6">
        <button
          onClick={() => {}}
          className="text-slate-500 hover:text-emerald-600 flex items-center gap-2"
        >
          retour
        </button>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          خريطة المرافق الصحية — الفيوم
        </h1>

        <FacilityFilterChips />

        <div className="mt-4 bg-white rounded-3xl shadow-sm border border-[#f3e8dd] overflow-hidden">
          <div className="h-[60vh]">
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
