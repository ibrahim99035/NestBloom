'use client';

import { useState, useEffect } from 'react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { Timer, Clock, CheckCircle, ArrowLeft, Activity } from 'lucide-react';

interface Contraction {
  start: string;
  end: string | null;
  duration: number;
}

export default function ContractionTimerPage() {
  const { currentWeek } = usePregnancyStore();
  const [isTiming, setIsTiming] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timer, setTimer] = useState(0);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [interval, setIntervalState] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('nestbloom-contractions');
    if (saved) {
      try {
        setContractions(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nestbloom-contractions', JSON.stringify(contractions));
  }, [contractions]);

  useEffect(() => {
    if (!isTiming || !startTime) return;
    const t = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isTiming, startTime]);

  const startContraction = () => {
    setStartTime(new Date());
    setTimer(0);
    setIsTiming(true);
  };

  const endContraction = () => {
    if (!startTime) return;
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const newContraction: Contraction = {
      start: startTime.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end: new Date().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration,
    };
    setContractions((prev) => [newContraction, ...prev].slice(0, 50));
    setIsTiming(false);
    setStartTime(null);
    setTimer(0);

    if (contractions.length > 0) {
      const prevStart = new Date();
      prevStart.setHours(
        parseInt(contractions[0].start.split(':')[0]),
        parseInt(contractions[0].start.split(':')[1])
      );
      const currStart = new Date();
      currStart.setHours(
        parseInt(newContraction.start.split(':')[0]),
        parseInt(newContraction.start.split(':')[1])
      );
      const diffMin = Math.round((currStart.getTime() - prevStart.getTime()) / (1000 * 60));
      setIntervalState(diffMin);
    } else {
      setIntervalState(0);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

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

          <div className="grid grid-cols-2 gap-4">
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
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      #{i + 1} — {c.start}
                    </p>
                    <p className="text-xs text-slate-500">
                      المدة: {Math.floor(c.duration / 60)}:{String(c.duration % 60).padStart(2, '0')} دقيقة
                    </p>
                  </div>
                  {c.end && (
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                      انتهت {c.end}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {interval > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 p-4 rounded-2xl bg-[#f3e8dd]">
              <p className="text-sm text-slate-800 font-medium">
                الفاصل المتوسط: {interval} دقيقة
              </p>
              {interval <= 5 && (
                <p className="text-xs text-red-600 font-medium mt-1">
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
