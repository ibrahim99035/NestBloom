'use client';

import { useState, useEffect } from 'react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { Clock, ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';

interface Contraction {
  start: number; // epoch ms
  end: number | null; // epoch ms
  duration: number; // seconds
}

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ContractionTimerPage() {
  const { currentWeek } = usePregnancyStore();
  const [isTiming, setIsTiming] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [contractions, setContractions] = useState<Contraction[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nestbloom-contractions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Ignore legacy entries that stored localized time strings.
          setContractions(
            parsed.filter(
              (c: Contraction) => typeof c.start === 'number' && Number.isFinite(c.start)
            )
          );
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nestbloom-contractions', JSON.stringify(contractions));
    } catch {
      // storage full / unavailable — keep the in-memory state working
    }
  }, [contractions]);

  // Derive the elapsed time from the timestamp instead of counting ticks,
  // so the timer stays accurate when the tab is backgrounded.
  useEffect(() => {
    if (!isTiming || startTime === null) return;
    const update = () => setTimer(Math.floor((Date.now() - startTime) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isTiming, startTime]);

  const startContraction = () => {
    setStartTime(Date.now());
    setTimer(0);
    setIsTiming(true);
  };

  const endContraction = () => {
    if (startTime === null) return;
    const end = Date.now();
    const newContraction: Contraction = {
      start: startTime,
      end,
      duration: Math.floor((end - startTime) / 1000),
    };
    setContractions((prev) => [newContraction, ...prev].slice(0, 50));
    setIsTiming(false);
    setStartTime(null);
    setTimer(0);
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  // Gaps between consecutive contractions (list is newest-first).
  const gaps = contractions.slice(0, -1).map((c, i) =>
    Math.max(0, Math.round((c.start - contractions[i + 1].start) / 60000))
  );
  const avgInterval = gaps.length
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    : 0;
  const lastInterval = gaps.length ? gaps[0] : 0;

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
              <h2 className="text-xl font-bold text-slate-800">عداد الانقباضات</h2>
              <p className="text-slate-500 text-sm">
                أسبوع {currentWeek} — وقتِي مدة وفاصل الانقباضات
              </p>
            </div>
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>

          <div className="text-center mb-6">
            <div className="text-8xl font-mono font-bold text-slate-800 tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds
                .toString()
                .padStart(2, '0')}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {!isTiming ? (
              <button
                onClick={startContraction}
                className="bg-emerald-500 text-white py-6 rounded-2xl font-bold text-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200"
              >
                بدء انقباض
              </button>
            ) : (
              <button
                onClick={endContraction}
                className="bg-red-500 text-white py-6 rounded-2xl font-bold text-xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
              >
                إيقاف انقباض
              </button>
            )}
          </div>

          {isTiming && (
            <p className="text-center text-sm text-slate-500 mt-3">
              الجاري الآن…
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            سجل الانقباضات
          </h3>
          {contractions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">لا توجد انقباضات مسجلة</p>
          ) : (
            <div className="space-y-3">
              {contractions.map((c, i) => (
                <div
                  key={c.start}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      #{contractions.length - i} — {formatTime(c.start)}
                    </p>
                    <p className="text-xs text-slate-500">
                      المدة: {Math.floor(c.duration / 60)}:
                      {String(c.duration % 60).padStart(2, '0')} دقيقة
                    </p>
                  </div>
                  {c.end !== null && (
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                      انتهت {formatTime(c.end)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {gaps.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 p-4 rounded-2xl bg-[#f3e8dd]">
              <p className="text-sm text-slate-800 font-medium">
                الفاصل الأخير: {lastInterval} دقيقة
              </p>
              <p className="text-xs text-slate-600 mt-1">
                متوسط الفاصل: {avgInterval} دقيقة
              </p>
              {avgInterval > 0 && avgInterval <= 5 && (
                <p className="text-xs text-red-600 font-medium mt-2">
                  ⚠️ الانقباضات متقاربة — راجعي الطبيب إذا استمرت
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
