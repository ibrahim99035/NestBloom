'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { ArrowLeft, User, Calendar, Bell, Lock, LogOut, Mail, Edit } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const {
    dueDate,
    lmpDate,
    currentWeek,
    currentDay,
    isHighRisk,
    isMultiple,
    reset,
    setDates,
  } = usePregnancyStore();
  const [editing, setEditing] = useState(false);
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    const value = dueDate || lmpDate;
    if (!value) {
      setNewDate('');
      return;
    }
    const date = new Date(value);
    setNewDate(isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10));
  }, [dueDate, lmpDate]);

  const savePregnancy = () => {
    if (!newDate) return;
    const date = new Date(newDate);
    setDates(date, null);
    setEditing(false);
  };

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-800">الإعدادات</h1>
            <User className="w-6 h-6 text-emerald-500" />
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#f3e8dd] border border-[#e7d5c3]">
              <h3 className="text-sm font-bold text-slate-800 mb-3">بيانات الحمل</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">الأسبوع الحالي:</span>
                  <span className="font-medium text-slate-800">{currentWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">اليوم:</span>
                  <span className="font-medium text-slate-800">{currentDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الموعد المتوقع:</span>
                  <span className="font-medium text-slate-800">
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString('ar-EG')
                      : 'غير مضبوط'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حمل عالي المخاطر:</span>
                  <span className={`font-medium ${isHighRisk ? 'text-red-600' : 'text-slate-800'}`}>
                    {isHighRisk ? 'نعم' : 'لا'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حمل متعدد:</span>
                  <span className={`font-medium ${isMultiple ? 'text-red-600' : 'text-slate-800'}`}>
                    {isMultiple ? 'نعم' : 'لا'}
                  </span>
                </div>
              </div>
              {editing ? (
                <div className="mt-4 flex gap-2">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={savePregnancy}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  تعديل الموعد المتوقع
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">الإشعارات</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-800">تذكيرات يومية</span>
                    <p className="text-xs text-slate-500">تذكير بتسجيل المهام اليومية</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-200 text-emerald-500 focus:ring-emerald-500"
                    />
                    <Bell className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-800">تذكير بموعد الطبيب</span>
                    <p className="text-xs text-slate-500">إشعار قبل موعد الزيارة بيوم</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-200 text-emerald-500 focus:ring-emerald-500"
                    />
                    <Calendar className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">الخصوصية والأمان</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-800">تشفير البيانات</span>
                    <p className="text-xs text-slate-500">بياناتك مشفرة وخاصة</p>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-800">تصدير التقرير للطبيب</span>
                    <p className="text-xs text-slate-500">تحميل تقرير PDF لزيارتك القادمة</p>
                  </div>
                  <Mail className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">الحساب</h3>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-slate-600 flex items-center gap-1 hover:text-emerald-600 transition-all"
              >
                <User className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
              <h3 className="text-sm font-bold text-red-800 mb-3">منطقة الخطر</h3>
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكدة من إعادة ضبط جميع البيانات؟')) {
                    reset();
                    Object.keys(localStorage)
                      .filter((key) => key.startsWith('nestbloom'))
                      .forEach((key) => localStorage.removeItem(key));
                    window.location.href = '/';
                  }
                }}
                className="text-sm text-red-600 flex items-center gap-1 hover:underline"
              >
                <LogOut className="w-4 h-4" />
                إعادة ضبط البيانات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
