'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide.react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleDevSignIn = async () => {
    setError('');
    try {
      const res = await fetch('/api/auth/dev-signin?callbackUrl=/', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('فشل تسجيل الدخول التجريبي.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول.');
    }
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل إرسال الرابط');
        setIsLoading(false);
        return;
      }

      setSent(true);
      setIsLoading(false);
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الرابط.');
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 dir-rtl">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#f3e8dd] text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#453a32] mb-2">تم إرسال الرابط ✓</h1>
          <p className="text-[#6b6b6b] mb-6">
            فحصي بريدك الإلكتروني ({email}) وانقر على الرابط لتسجيل الدخول.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-xl bg-slate-200 text-[#453a32] font-semibold text-lg hover:bg-slate-300 transition-all"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 dir-rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#f3e8dd]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#453a32] mb-2">مرحباً بعودتك</h1>
          <p className="text-[#6b6b6b]">سجلي دخولك إلى نِست بلوم</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-4 text-xs text-[#6b6b6b] bg-[#fdfbf7]">
              أو
            </span>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#453a32] mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="example@email.com"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'جاري الإرسال…' : <><ArrowRight className="w-5 h-5" /> إرسال رابط الدخول</>}
            </button>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-4 text-xs text-[#6b6b6b] bg-[#fdfbf7]">
              أو
            </span>
          </div>

          <button
            onClick={handleDevSignIn}
            className="w-full py-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <Mail className="w-5 h-5" />
            دخول سريع (وضع التطوير)
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-[#6b6b6b]">
          الدخول السريع ينشئ حساباً تجريبياً للاستكشاف فقط
        </p>
      </div>
    </div>
  );
}
