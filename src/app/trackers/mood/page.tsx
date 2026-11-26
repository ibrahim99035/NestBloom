'use client';

import { useState, useEffect } from 'react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { Heart, Smile, Meh, Frown, Activity, ArrowLeft, CheckCircle } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: number;
  note?: string;
}

const MOOD_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'سيء جداً', color: '#ef4444' },
  2: { label: 'سيء', color: '#f97316' },
  3: { label: 'معتدل', color: '#eab308' },
  4: { label: 'جيد', color: '#84cc16' },
  5: { label: 'ممتاز', color: '#22c55e' },
};

export default function MoodTrackerPage() {
  const { currentWeek } = usePregnancyStore();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nestbloom-mood-entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed);
        const today = new Date().toISOString().split('T')[0];
        setTodayLogged(parsed.some((e: MoodEntry) => e.date === today));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nestbloom-mood-entries', JSON.stringify(entries));
  }, [entries]);

  const logMood = () => {
    if (!selectedMood) return;
    const today = new Date().toISOString().split('T')[0];
    setEntries((prev) => [
      { date: today, mood: selectedMood, note: note || undefined },
      ...prev.filter((e) => e.date !== today),
    ]);
    setTodayLogged(true);
  };

  const avgMood =
    entries.length > 0
      ? Math.round(
          (entries.reduce((sum: number, e: MoodEntry) => sum + e.mood, 0) / entries.length) *
            10
        ) / 10
      : 0;

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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">تتبع المزاج</h2>
              <p className="text-slate-500 text-sm">
                أسبوع {currentWeek} — كيف تشعرين اليوم؟
              </p>
            </div>
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>

          {todayLogged && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="font-medium text-emerald-700">تم تسجيل مزاجك اليوم ✓</p>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {Object.entries(MOOD_LABELS).map(([level, config]) => {
              const Icon = selectedMood === parseInt(level) ? Heart : Heart;
              const selected = selectedMood === parseInt(level);
              const iconMap: Record<number, any> = {
                1: Frown,
                2: Frown,
                3: Meh,
                4: Smile,
                5: Heart,
              };
              const IconComp = iconMap[parseInt(level)];
              return (
                <button
                  key={level}
                  onClick={() => setSelectedMood(parseInt(level))}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    selected
                      ? `bg-${config.color.replace('#', '')} text-white shadow-lg`
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-800 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote((e.target as HTMLTextAreaElement).value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="مثلاً: شعرت بالتعب بعد المشي، أو فرحته بحركة الجنين…"
            />
          </div>

          <button
            onClick={logMood}
            disabled={!selectedMood || todayLogged}
            className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              selectedMood && !todayLogged
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {todayLogged ? 'مسجل اليوم ✓' : 'سجلي مزاجك'}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">متوسط المزاج هذا الأسبوع</h3>
            <span className={`text-2xl font-bold ${avgMood >= 4 ? 'text-emerald-600' : avgMood >= 3 ? 'text-[#eab308]' : 'text-red-500'}`}>
              {avgMood || '—'}/5
            </span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full transition-all ${
                  i < Math.floor(avgMood)
                    ? 'bg-emerald-500'
                    : i === Math.floor(avgMood) && avgMood % 1 !== 0
                    ? 'bg-[#eab308]'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-800 mb-3">السجل الأسبوعي</h4>
            <div className="space-y-2">
              {entries.slice(0, 7).map((e: MoodEntry, i: number) => {
                const config = MOOD_LABELS[e.mood];
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-800">{e.date}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium" style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
