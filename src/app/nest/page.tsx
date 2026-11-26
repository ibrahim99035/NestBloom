'use client';

import { Activity, ArrowLeft, Heart, Star, Gift, Users } from 'lucide-react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';

const NEST_ITEMS = [
  {
    name: 'مستوى العش',
    value: 'المستوى 3',
    desc: 'أنت تتقدمين بشكل جميل',
    icon: Activity,
    colorClass: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  },
  {
    name: 'النقاط المجمعة',
    value: '1,240 XP',
    desc: 'من المهام اليومية والمتابعة',
    icon: Star,
    colorClass: 'border-amber-100 bg-amber-50 text-amber-600',
  },
  {
    name: "أزياء الطفل",
    value: '5 قطع',
    desc: 'تم فك قفلها من الإنجازات',
    icon: Gift,
    colorClass: 'border-pink-100 bg-pink-50 text-pink-600',
  },
  {
    name: 'الشريك',
    value: 'غير مرتبط',
    desc: 'يمكنك دعوة شريكك للمشاركة',
    icon: Users,
    colorClass: 'border-blue-100 bg-blue-50 text-blue-600',
  },
] as const;

export default function NestPage() {
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">عشك 🐦</h1>
            <p className="text-slate-500">
              أسبوع {currentWeek} — نميتي عشك مع كل مهمة تكتملينها
            </p>
          </div>
          <Activity className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#f3e8dd] mx-auto mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-100/30 animate-pulse rounded-full" />
            <span className="text-6xl">🐦</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                المستوى 3
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-sm">عشك ينمو مع كل خطوة تخطوها في رحلتك</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {NEST_ITEMS.map((item) => (
            <div key={item.name} className={`p-4 rounded-2xl border flex items-center gap-4 ${item.colorClass}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">{item.name}</p>
                <p className="font-bold text-slate-800">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            الإنجازات
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'أول يوم', unlocked: true },
              { label: 'أسبوع كامل', unlocked: true },
              { label: 'شهر من المتابعة', unlocked: false },
              { label: 'نصف الطريق', unlocked: false },
            ].map((b) => (
              <div
                key={b.label}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                  b.unlocked
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                    : 'border-slate-100 bg-slate-50 text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  b.unlocked ? 'bg-emerald-200' : 'bg-slate-200'
                }`}>
                  <span className="text-xs">{b.unlocked ? '✓' : '?'}</span>
                </div>
                <span className="text-xs font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
