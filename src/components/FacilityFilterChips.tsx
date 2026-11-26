'use client';

import { useFacilitiesStore } from '@/stores/useFacilitiesStore';
import type { FacilityType } from '@/components/FayoumHealthMap';

const TYPE_LABELS: Record<FacilityType, string> = {
  emergency: 'طوارئ',
  insurance: 'تأمين صحي',
  children: 'أطفال',
  specialized: 'تخصصي',
  phc: 'رعاية أساسية',
  other: 'أخرى',
};

const TYPE_COLORS: Record<FacilityType, string> = {
  emergency: 'bg-red-500',
  insurance: 'bg-purple-500',
  children: 'bg-blue-500',
  specialized: 'bg-pink-500',
  phc: 'bg-emerald-500',
  other: 'bg-slate-400',
};

export default function FacilityFilterChips() {
  const { filters, toggleFilter, clearFilters } = useFacilitiesStore();

  const types: FacilityType[] = ['emergency', 'insurance', 'children', 'specialized', 'phc', 'other'];

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white border-b border-[#f3e8dd]">
      <button
        onClick={clearFilters}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          filters.size === 0
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-100 text-[#453a32] hover:bg-slate-200'
        }`}
      >
        الكل
      </button>
      {types.map((type) => {
        const active = filters.has(type);
        return (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              active
                ? `${TYPE_COLORS[type]} text-white`
                : 'bg-slate-100 text-[#453a32] hover:bg-slate-200'
            }`}
          >
            <span className="text-xs">{TYPE_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
