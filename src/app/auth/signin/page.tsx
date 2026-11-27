'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </svg>
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickLoading, setIsQuickLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleQuickSignIn = async () => {
    setError('');
    setIsQuickLoading(true);
    try {
      // redirect:false keeps us independent of NEXTAUTH_URL; reload manually.
      const result = await signIn('quick', { redirect: false });
      if (result?.ok) {
        window.location.href = '/';
        return;
      }
      // Fallback: server-issued session cookie for the same default account.
      const res = await fetch('/api/auth/dev-signin', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
        return;
      }
      setError('تعذّر تسجيل الدخول. حاولي مرة أخرى.');
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setIsQuickLoading(false);
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
        return;
      }

      setSent(true);
    } catch {
      setError('حدث خطأ أثناء إرسال الرابط.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 dir-rtl">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#f3e8dd] text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <MailIcon />
          </div>
          <h1 className="text-2xl font-bold text-[#453a32] mb-2">تم إرسال الرابط ✓</h1>
          <p className="text-[#6b6b6b] mb-6">
            فحصي بريدك الإلكتروني ({email}) وانقري على الرابط لتسجيل الدخول.
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
          <h1 className="text-3xl font-bold text-[#453a32] mb-2">مرحباً بك 🌸</h1>
          <p className="text-[#6b6b6b]">ادخلي إلى نِست بلوم في خطوة واحدة</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleQuickSignIn}
          disabled={isQuickLoading}
          className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          <SparkleIcon />
          {isQuickLoading ? 'جارٍ الدخول…' : 'دخول سريع — ابدئي الآن'}
        </button>

        <p className="mt-3 text-center text-xs text-[#6b6b6b]">
          يستخدم حساباً افتراضياً جاهزاً، دون بريد أو كلمة مرور
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-4 text-xs text-[#6b6b6b] bg-white">أو عبر البريد</span>
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
            className="w-full py-3.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-semibold text-lg hover:bg-emerald-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'جاري الإرسال…' : <><ArrowRightIcon /> إرسال رابط الدخول</>}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#6b6b6b]">
          بياناتك محفوظة على جهازك فقط
        </p>
      </div>
    </div>
  );
}
