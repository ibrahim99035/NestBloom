'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePregnancyStore } from '@/stores/usePregnancyStore';
import { useFacilitiesStore } from '@/stores/useFacilitiesStore';
import FayoumHealthMap from '@/components/FayoumHealthMap';
import FacilityBottomSheet from '@/components/FacilityBottomSheet';
import FacilityFilterChips from '@/components/FacilityFilterChips';
import RiveAvatar from '@/components/RiveAvatar';
import {
  Heart,
  Droplets,
  Clock,
  Calendar,
  MapPin,
  Baby,
  CheckCircle,
  ArrowLeft,
  Activity,
  BookOpen,
  Settings,
  Home as HomeIcon,
} from 'lucide-react';
import Link from 'next/link';
import InstallAppCard from '@/components/InstallAppCard';

const QUESTS = [
  { id: 'water', title: 'اشربي كوب ماء', icon: Droplets, xp: 10, href: '/' },
  { id: 'vitamin', title: 'خذي الفيتامينات', icon: Heart, xp: 15, href: '/' },
  { id: 'mood', title: 'سجلي مزاجك', icon: Clock, xp: 10, href: '/trackers/mood' },
  { id: 'kick', title: 'عدّ حركات الجنين', icon: Baby, xp: 20, href: '/trackers/kicks' },
];

const NAV_ITEMS = [
  { name: 'الرئيسية', href: '/', icon: HomeIcon },
  { name: 'العش', href: '/nest', icon: Activity },
  { name: 'المراقبات', href: '/trackers', icon: Activity },
  { name: 'اليوميات', href: '/journal', icon: BookOpen },
  { name: 'الخريطة', href: '/map', icon: MapPin },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
] as const;

export default function Home() {
  const { data: session } = useSession();
  const {
    currentWeek,
    currentDay,
    gestationalProgress,
    stage,
    dueDate,
    lmpDate,
  } = usePregnancyStore();
  const {
    facilities,
    isLoading,
    setFacilities,
    setLoading,
    filteredFacilities,
  } = useFacilitiesStore();
  const [selectedFacility, setSelectedFacility] = useState<ReturnType<typeof filteredFacilities>[number] | null>(null);
  const [activeSection, setActiveSection] = useState<'home' | 'map'>('home');
  const router = useRouter();

  // Redirect to setup if pregnancy not configured yet
  useEffect(() => {
    if (session && !dueDate && !lmpDate) {
      router.push('/setup');
    }
  }, [session, dueDate, lmpDate, router]);

  useEffect(() => {
    if (isLoading) return;
    fetch('/data/fayoum-facilities.geojson')
      .then((res) => res.json())
      .then((geojson: any) => {
        const facs = geojson.features.map((f: any) => ({
          id: f.properties.id,
          properties: f.properties,
          geometry: f.geometry,
        }));
        setFacilities(facs);
        setLoading(false);
      });
    setLoading(true);
  }, [setFacilities, setLoading, isLoading]);

  const toggleQuest = (id: string) => {
    setCompletedQuests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  const daysLeft = Math.max(0, 280 - Math.floor(gestationalProgress * 7));

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4 py-10">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#453a32] mb-2">نِست بلوم</h1>
            <p className="text-[#6b6b6b] mb-6">رحلتك في الحمل… يوم بيوم بجمال واهتمام</p>
            <a href="/auth/signin" className="inline-block px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all">
              سجلي الدخول للبدء
            </a>
          </div>
          <InstallAppCard />
        </div>
      </div>
    );
  }

  const stageLabel = stage === 'first' ? 'الأول' : stage === 'second' ? 'الثاني' : 'الثالث';

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 dir-rtl">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#453a32]">صباح الخير 🌸</h1>
          <p className="text-[#6b6b6b]">
            أسبوع {currentWeek}، يوم {currentDay} من رحلتك
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[#6b6b6b] mb-2">
          <span>تقدم الحمل</span>
          <span>{Math.round((gestationalProgress / 40) * 100)}%</span>
        </div>
        <div className="w-full bg-[#f3e8dd] h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (gestationalProgress / 40) * 100)}%` }}
          />
        </div>
        <p className="text-sm text-[#453a32] mt-2">
          يبقى {daysLeft} يوم حتى الموعد المتوقع
        </p>
      </div>

      <div className="mb-6">
        <InstallAppCard />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Avatar + Quest */}
        <div className="lg:col-span-7 space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#f3e8dd] p-6">
            <div className="flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative">
                <RiveAvatar
                  gestationalProgress={gestationalProgress}
                  stage={stage}
                  width={280}
                  height={360}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <span className="text-emerald-600 font-medium text-sm px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    المرحلة: {stageLabel}
                  </span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h2 className="text-xl font-bold text-[#453a32]">طفلك ينمو</h2>
                <p className="text-[#6b6b6b] mt-1">
                  المرحلة {
                    stage === 'first' ? 'الأولى' : stage === 'second' ? 'الثانية' : 'الثالثة'
                  } من الحمل
                </p>
              </div>
            </div>
          </div>

          {/* Quests */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#f3e8dd] p-6">
            <h3 className="text-lg font-bold text-[#453a32] mb-4">مهامك اليومية</h3>
            <div className="space-y-3">
              {QUESTS.map((quest) => {
                const done = completedQuests.has(quest.id);
                return (
                  <div
                    key={quest.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      done
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleQuest(quest.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-200 text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        {done && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <quest.icon className="w-5 h-5 text-[#6b6b6b]" />
                      <Link
                        href={quest.href}
                        className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-[#453a32]'}`}
                      >
                        {quest.title}
                      </Link>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      +{quest.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Map + Nearest Care */}
        <div className="lg:col-span-5 space-y-6">
          {/* Filter chips */}
          <FacilityFilterChips />

          {/* Map */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#f3e8dd] overflow-hidden">
            <div className="p-3 border-b border-[#f3e8dd] bg-slate-50/50">
              <h3 className="text-sm font-bold text-[#453a32] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                المراكز الصحية القريبة
              </h3>
            </div>
            <div className="h-[320px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-[#6b6b6b]">
                  تحميل الخريطة…
                </div>
              ) : (
                <FayoumHealthMap
                  facilities={filteredFacilities()}
                  onFacilityClick={(f) => setSelectedFacility(f)}
                  cluster={true}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#f3e8dd] p-6">
            <h3 className="text-lg font-bold text-[#453a32] mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/map">
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center">
                    <Baby className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">أقرب مستشفى للولادة</span>
                </button>
              </Link>
              <Link href="/trackers/kicks">
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#f3e8dd] border border-[#f3e8dd] text-[#453a32] hover:bg-[#e7d5c3] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#e7d5c3] flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">عدّ الحركات</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <FacilityBottomSheet
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />
    </div>
  );
}
