'use client';

import { useState } from 'react';
import { Phone, Clock, MapPin, List, X, ChevronUp } from 'lucide-react';
import type { Facility } from '@/components/FayoumHealthMap';

interface FacilityBottomSheetProps {
  facility: Facility | null;
  onClose: () => void;
}

export default function FacilityBottomSheet({
  facility,
  onClose,
}: FacilityBottomSheetProps) {
  if (!facility) return null;
  const [expanded, setExpanded] = useState(false);
  const props = facility.properties;

  return (
    <div
      className={`fixed bottom-0 right-0 left-0 z-50 transition-all duration-300 ${
        expanded
          ? 'h-[85vh]'
          : 'h-20'
      } bg-white rounded-t-3xl shadow-2xl border-t border-[#f3e8dd] flex flex-col`}
    >
      {/* Handle */}
      <div className="flex justify-center py-2">
        <div className="w-12 h-1.5 bg-[#e7d5c3] rounded-full" />
      </div>

      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#f3e8dd] bg-[#fdfbf7]/50">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              TYPE_COLOR_MAP[props.type]
            } text-white`}>
              {TYPE_LABEL_MAP[props.type]}
            </span>
            {props.emergency && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                طوارئ 24 ساعة
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-[#453a32] mt-1">{props.name_ar}</h3>
          {props.name_en && (
            <p className="text-sm text-[#6b6b6b]">{props.name_en}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-100 text-[#453a32] flex items-center justify-center hover:bg-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Expandable content */}
      <div
        className="flex-1 overflow-y-auto p-5"
        onDoubleClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between mb-4 cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setExpanded(!expanded)}>
          <span className="text-sm font-medium text-[#453a32]">تفاصيل أكثر</span>
          <ChevronUp className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[#453a32] font-medium">الهاتف</p>
                <p className="text-[#6b6b6b]">{props.phone || 'غير متوفر'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[#453a32] font-medium">ساعات العمل</p>
                <p className="text-[#6b6b6b]">{props.openingHours || 'غير متوفر'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[#453a32] font-medium">العنوان</p>
                <p className="text-[#6b6b6b]">{props.address || 'غير متوفر'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <List className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[#453a32] font-medium">الخدمات المتاحة</p>
                <p className="text-[#6b6b6b]">{props.services || 'غير متوفر'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f3e8dd] space-y-3">
              <button
                onClick={() => window.location.href = `tel:${props.phone}`}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
              >
                <Phone className="w-5 h-5" />
                اتصل الآن
              </button>
              <button
                onClick={() => {
                  const [lng, lat] = facility.geometry.coordinates;
                  window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                }}
                className="w-full py-3.5 rounded-xl bg-[#f3e8dd] text-[#453a32] font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#e7d5c3] transition-all"
              >
                <MapPin className="w-5 h-5" />
                اتجاهات على الخريطة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TYPE_LABEL_MAP: Record<string, string> = {
  emergency: 'مستشفى عام / طوارئ',
  insurance: 'مستشفى تأمين صحي',
  children: 'مستشفى أطفال',
  specialized: 'مستشفى تخصصي',
  phc: 'وحدة رعاية أساسية',
  other: 'أخرى',
};

const TYPE_COLOR_MAP: Record<string, string> = {
  emergency: 'bg-red-500',
  insurance: 'bg-purple-500',
  children: 'bg-blue-500',
  specialized: 'bg-pink-500',
  phc: 'bg-emerald-500',
  other: 'bg-slate-400',
};
