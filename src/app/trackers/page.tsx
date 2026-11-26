'use client';

import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { Activity, ArrowLeft, Baby, Clock, Heart } from 'lucide-react';

const TRACKERS = [
  {
    name: 'عدّ حركات الجنين',
    href: '/trackers/kicks',
    icon: Baby,
    colorClass: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    desc: 'عدّي الحركات يومياً من الأسبوع 28',
  },
  {
    name: 'عداد الانقباضات',
    href: '/trackers/contractions',
    icon: Clock,
    colorClass: 'border-red-100 bg-red-50 text-red-600',
    desc: 'وقتِي مدة وفاصل الانقباضات',
  },
  {
    name: 'تتبع المزاج',
    href: '/trackers/mood',
    icon: Heart,
    colorClass: 'border-pink-100 bg-pink-50 text-pink-600',
    desc: 'سجلي مزاجك يومياً',
  },
] as const;

export default function TrackersPage() {
  const { currentWeek } = usePregnancyStore();

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 dir-rtl">
      <nav className="mb-6">
        <button
          onClick={() => {}}
          className="text-slate-500 hover:text-emerald-600 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
        </button>
      </nav>

      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">المراقبات</h1>
            <p className="text-slate-500">أسبوع {currentWeek} — اختري ما تريدين تتبعه</p>
          </div>
          <Activity className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="space-y-3">
          {TRACKERS.map((t) => (
            <a key={t.name} href={t.href} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${t.colorClass}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
                  <t.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-400">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
