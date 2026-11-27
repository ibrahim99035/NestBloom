'use client';

import { useState, useEffect } from 'react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { Heart, Timer, CheckCircle, ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';

interface KickEntry {
  time: string;
  count: number;
}

export default function KickCounterPage() {
  const { currentWeek } = usePregnancyStore();
  const [count, setCount] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [sessions, setSessions] = useState<KickEntry[]>([]);
  const [goal, setGoal] = useState(10);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nestbloom-kick-sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nestbloom-kick-sessions', JSON.stringify(sessions));
    } catch {
      // storage full / unavailable — keep the in-memory state working
    }
  }, [sessions]);

  const startSession = () => {
    setCount(0);
    setSessionStart(new Date());
    setIsCounting(true);
    setShowCelebration(false);
  };

  const addKick = () => {
    const next = count + 1;
    setCount(next);
    if (next >= goal) {
      setShowCelebration(true);
      setIsCounting(false);
    }
  };

  const finishSession = () => {
    if (!sessionStart) return;
    const entry: KickEntry = {
      time: sessionStart.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      count,
    };
    setSessions((prev) => [entry, ...prev].slice(0, 50));
    setIsCounting(false);
    setSessionStart(null);
    setShowCelebration(false);
  };

  const lastSession = sessions[0];
  const avgCount =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.count, 0) / sessions.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 dir-rtl">
      <nav className="mb-6">
        <Link
          href="/"
          className="text-slate-500 hover:text-emerald-600 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
        </Link>
      </nav>

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">عدّ حركات الجنين</h2>
              <p className="text-slate-500 text-sm">
                أسبوع {currentWeek} — الهدف: {goal} حركات في ساعتين
              </p>
            </div>
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2">
              <span className="text-6xl font-bold text-slate-800">{count}</span>
              <span className="text-lg text-slate-500 self-end">حركة</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isCounting && !showCelebration ? (
              <button
                onClick={addKick}
                className="bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xl hover:bg-emerald-600 transition-all active:scale-95"
              >
                + حركة
              </button>
            ) : (
              <button
                onClick={startSession}
                className="bg-[#f3e8dd] text-slate-800 py-4 rounded-2xl font-bold text-xl hover:bg-[#e7d5c3] transition-all"
                disabled={showCelebration}
              >
                {showCelebration ? 'اكتمل الهدف ✓' : 'بدء الجلسة'}
              </button>
            )}
            <button
              onClick={finishSession}
              className="border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              disabled={count === 0 || (!isCounting && !showCelebration)}
            >
              إنهاء الجلسة
            </button>
          </div>

          {showCelebration && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center animate-bounce">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-emerald-700">وصلتي للهدف! 🎉</p>
              <p className="text-sm text-emerald-600">حركات الجنين طبيعية، اطمئني 🌸</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-emerald-500" />
            الجلسات الأخيرة
          </h3>
          {sessions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">لا توجد جلسات بعد</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      الجلسة {i + 1}
                    </p>
                    <p className="text-xs text-slate-500">{s.time}</p>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">
                    {s.count} حركة
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              المعدل المتوسط: <span className="font-bold text-slate-800">{avgCount} حركة</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
