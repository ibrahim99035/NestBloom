'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { Calendar, Baby, ArrowRight } from 'lucide-react';

type Mode = 'dueDate' | 'lmpDate';

export default function SetupPage() {
  const router = useRouter();
  const { setDates, setLMPDate, setRiskFlags, dueDate, lmpDate } = usePregnancyStore();
  const [mode, setMode] = useState<Mode>('dueDate');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already configured, go home
    if (dueDate || lmpDate) {
      router.push('/');
    }
  }, [dueDate, lmpDate, router]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) {
      setError('برجاء اختيار تاريخ');
      return;
    }

    const date = new Date(selectedDate);
    if (isNaN(date.getTime())) {
      setError('تاريخ غير صحيح');
      return;
    }

    if (mode === 'dueDate') {
      setDates(date, null);
    } else {
      setLMPDate(date);
    }
    setRiskFlags(isHighRisk, isMultiple);

    router.push('/');
  };

  const label = mode === 'dueDate' ? 'الموعد المتوقع للولادة' : 'تاريخ آخر دورة شهرية';
  const hint =
    mode === 'dueDate'
      ? 'إذا كنت تعرفين موعد الولادة المتوقع من الطبيب'
      : 'إذا كنت تعرفين تاريخ أول يوم في آخر دورة شهرية لك';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 dir-rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#f3e8dd]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Baby className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#453a32] mb-2">بدء رحلتك</h1>
          <p className="text-[#6b6b6b]">مرحباً بك في نِست بلوم 🌸</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('dueDate')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                mode === 'dueDate'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-[#453a32] hover:bg-slate-200'
              }`}
            >
              موعد الولادة
            </button>
            <button
              type="button"
              onClick={() => setMode('lmpDate')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                mode === 'lmpDate'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-[#453a32] hover:bg-slate-200'
              }`}
            >
              آخر دورة شهرية
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#453a32] block">{label}</label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-[#6b6b6b]">{hint}</p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-[#453a32] block">حالات خاصة</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isHighRisk}
                onChange={(e) => setIsHighRisk(e.target.checked)}
                className="rounded border-slate-200 text-emerald-500 focus:ring-emerald-500"
              />
              <label className="text-sm text-[#453a32] cursor-pointer">حمل عالي المخاطر</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isMultiple}
                onChange={(e) => setIsMultiple(e.target.checked)}
                className="rounded border-slate-200 text-emerald-500 focus:ring-emerald-500"
              />
              <label className="text-sm text-[#453a32] cursor-pointer">حمل متعدد (توأم أو أكثر)</label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            disabled={!selectedDate}
          >
            <ArrowRight className="w-5 h-5" />
            بدء الرحلة
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full py-2 text-sm text-[#6b6b6b] hover:text-emerald-600 transition-all"
          >
            تخطي الآن
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#6b6b6b]">
          يمكن تعديل هذه البيانات لاحقاً من الإعدادات
        </p>
      </div>
    </div>
  );
}
