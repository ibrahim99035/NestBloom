'use client';

import { useEffect, useState } from 'react';
import { Download, Info } from 'lucide-react';

const APK_URL =
  'https://github.com/ibrahim99035/NestBloom/releases/download/apk-latest/nestbloom.apk';

export default function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [installHelpText, setInstallHelpText] = useState('');

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsPWAInstalled(true);
      setDeferredPrompt(null);
      return;
    }

    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      setInstallHelpText('في سفاري: اضغطي على زر المشاركة ⬆️ ثم اختاري «إضافة إلى الشاشة الرئيسية».');
    } else if (isAndroid) {
      setInstallHelpText('من قائمة المتصفح ⋮ اختاري «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».');
    } else {
      setInstallHelpText('من قائمة المتصفح اختاري «تثبيت التطبيق» أو استخدمي زر التثبيت في شريط العنوان.');
    }
    setShowInstallHelp(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#f3e8dd] p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#453a32] mb-2">حمّلي التطبيق</h3>
          <p className="text-sm text-[#6b6b6b]">
            ثبّتي نِست بلوم على هاتفك للوصول السريع إلى كل الميزات
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            id="install-pwa-btn"
            onClick={handleInstallPWA}
            disabled={isPWAInstalled}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-lg transition-all ${
              isPWAInstalled
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
            }`}
          >
            <Download className="w-5 h-5" />
            {isPWAInstalled ? 'تم التثبيت ✓' : 'ثبّتي التطبيق'}
          </button>

          <a
            href={APK_URL}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-lg transition-all bg-[#f3e8dd] text-[#453a32] hover:bg-[#e7d5c3] shadow-sm"
          >
            <Download className="w-5 h-5" />
            تحميل نسخة أندرويد (APK)
          </a>
        </div>
      </div>
      {showInstallHelp && !isPWAInstalled && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{installHelpText}</span>
        </div>
      )}
    </div>
  );
}
