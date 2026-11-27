import type { Metadata } from 'next';
import InstallAppCard from '@/components/InstallAppCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'تحميل التطبيق | نِست بلوم',
  description: 'حمّلي تطبيق نِست بلوم على هاتفك — نسخة الويب القابلة للتثبيت أو ملف APK لأندرويد.',
};

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#fdfbf7] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#453a32] mb-2">حمّلي نِست بلوم</h1>
          <p className="text-[#6b6b6b]">
            اختاري طريقة التثبيت المناسبة لهاتفك — كلاهما يعطيك نفس التجربة الكاملة.
          </p>
        </div>

        <InstallAppCard />

        <div className="bg-white rounded-3xl shadow-sm border border-[#f3e8dd] p-6 space-y-3 text-sm text-[#6b6b6b]">
          <h2 className="text-base font-bold text-[#453a32]">كيف أثبّت التطبيق؟</h2>
          <p>
            <span className="font-semibold text-[#453a32]">أندرويد:</span> من متصفح Chrome اضغطي
            «ثبّتي التطبيق»، أو نزّلي ملف APK وافتحيه لتثبيت التطبيق.
          </p>
          <p>
            <span className="font-semibold text-[#453a32]">آيفون:</span> من سفاري اضغطي زر المشاركة
            ⬆️ ثم «إضافة إلى الشاشة الرئيسية».
          </p>
          <p>
            <span className="font-semibold text-[#453a32]">كمبيوتر:</span> من شريط عنوان المتصفح
            اضغطي أيقونة التثبيت ⊕.
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-emerald-600 font-semibold hover:underline">
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
