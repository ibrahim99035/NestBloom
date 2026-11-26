'use client';

import { useState, useEffect } from 'react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { ArrowLeft, BookOpen, Image, Plus, Trash2, Clock } from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  mood?: number;
  photoUrls: string[];
  createdAt: string;
}

const MOOD_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'سيء جداً', color: '#ef4444' },
  2: { label: 'سيء', color: '#f97316' },
  3: { label: 'معتدل', color: '#eab308' },
  4: { label: 'جيد', color: '#84cc16' },
  5: { label: 'ممتاز', color: '#22c55e' },
};

export default function JournalPage() {
  const { currentWeek } = usePregnancyStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nestbloom-journal');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nestbloom-journal', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    if (!content.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      content,
      mood: mood ?? undefined,
      photoUrls: [...photos],
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setContent('');
    setMood(null);
    setPhotos([]);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

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

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">يوميات الحمل</h1>
            <p className="text-slate-500">أسبوع {currentWeek} — سجلي أفكارك ومشاعرك</p>
          </div>
          <BookOpen className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-800 mb-2">
              ماذا في بالك اليوم؟
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="أكتبي ملاحظاتك، أعراضك، أو أي أشياء تريدين تذكّرها لطبيبك…"
            />
          </div>

          <div className="flex gap-3 mb-4">
            {Object.entries(MOOD_LABELS).map(([level, config]) => {
              const selected = mood === parseInt(level);
              return (
                <button
                  key={level}
                  onClick={() => setMood(parseInt(level))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    selected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                صور (اختياري)
              </label>
              <div className="flex gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt="journal" className="w-16 h-16 rounded-xl object-cover" />
                    <button
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files ?? []);
                      files.forEach((file) => {
                        setPhotos((prev) => [...prev, URL.createObjectURL(file)]);
                      });
                    };
                    input.click();
                  }}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={saveEntry}
            disabled={!content.trim()}
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            حفظ المدخلة
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-200">
            مدخلاتك السابقة
          </h3>
          {entries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>لا توجد مدخلات بعد. ابدئي بكتابة يومياتك اليوم 🌸</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {entries.map((e) => (
                <div key={e.id} className="p-6 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">
                      {new Date(e.createdAt).toLocaleDateString('ar-SA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {e.mood !== undefined && e.mood !== null && MOOD_LABELS[e.mood] && (
                      <span className="text-xs font-medium" style={{ color: MOOD_LABELS[e.mood].color }}>
                        {MOOD_LABELS[e.mood].label}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 mb-3 line-clamp-3">{e.content}</p>
                  {e.photoUrls.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {e.photoUrls.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          alt="journal"
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => deleteEntry(e.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
