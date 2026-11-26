import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PregnancyStage = 'first' | 'second' | 'third' | 'postpartum';

export interface PregnancyDates {
  dueDate: Date | null;
  lmpDate: Date | null;
  currentWeek: number;
  currentDay: number;
  isHighRisk: boolean;
  isMultiple: boolean;
  gestationalProgress: number; // 0 to 40
  stage: PregnancyStage;
  setDates: (dueDate: Date | null, lmpDate: Date | null) => void;
  setLMPDate: (lmpDate: Date) => void;
  setProgress: (week: number, day: number) => void;
  calculateStage: () => PregnancyStage;
  reset: () => void;
}

const calculateProgress = (dueDate: Date, lmpDate: Date | null = null) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let diffDays: number;
  if (dueDate) {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } else if (lmpDate) {
    const lmp = new Date(lmpDate);
    lmp.setHours(0, 0, 0, 0);
    // 280 days from LMP = 40 weeks
    const daysSinceLMP = Math.ceil((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    diffDays = 280 - daysSinceLMP;
  } else {
    diffDays = 280;
  }

  const weeksRemaining = Math.floor(diffDays / 7);
  const daysRemaining = diffDays % 7;
  const currentWeek = Math.max(0, 40 - weeksRemaining);
  const currentDay = Math.max(0, 7 - daysRemaining - 1);
  const gestationalProgress = Math.min(40, Math.max(0, currentWeek + currentDay / 7));

  return { currentWeek, currentDay, gestationalProgress, diffDays };
};

export const usePregnancyStore = create<PregnancyDates>()(
  persist(
    (set, get) => ({
      dueDate: null,
      lmpDate: null,
      currentWeek: 0,
      currentDay: 0,
      isHighRisk: false,
      isMultiple: false,
      gestationalProgress: 0,
      stage: 'first',

      setDates: (dueDate, lmpDate) => {
        const now = new Date();

        if (!dueDate) {
          // No due date provided → day 0
          set({
            dueDate: null,
            lmpDate: lmpDate ?? null,
            currentWeek: 0,
            currentDay: 0,
            gestationalProgress: 0,
            stage: 'first',
          });
          return;
        }

        if (dueDate < now) {
          // Due date in the past → treat as day 0 of week 40 (post-term)
          set({
            dueDate,
            lmpDate: lmpDate ?? null,
            currentWeek: 40,
            currentDay: 0,
            gestationalProgress: 40,
            stage: 'postpartum',
          });
          return;
        }

        const { currentWeek, currentDay, gestationalProgress } =
          calculateProgress(dueDate, lmpDate);

        set({
          dueDate,
          lmpDate: lmpDate ?? null,
          currentWeek,
          currentDay,
          gestationalProgress,
          stage: get().calculateStage(),
        });
      },

      setLMPDate: (lmpDate) => {
        const now = new Date();
        if (lmpDate > now) {
          // LMP in the future → day 0
          set({
            lmpDate,
            dueDate: null,
            currentWeek: 0,
            currentDay: 0,
            gestationalProgress: 0,
            stage: 'first',
          });
          return;
        }

        // Due date = LMP + 280 days
        const dueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        const { currentWeek, currentDay, gestationalProgress } =
          calculateProgress(dueDate, lmpDate);

        set({
          lmpDate,
          dueDate,
          currentWeek,
          currentDay,
          gestationalProgress,
          stage: get().calculateStage(),
        });
      },

      setProgress: (week, day) => {
        const gestationalProgress = Math.min(40, Math.max(0, week + day / 7));
        set({ currentWeek: week, currentDay: day, gestationalProgress });
      },

      calculateStage: () => {
        const { currentWeek } = get();
        if (currentWeek <= 13) return 'first';
        if (currentWeek <= 27) return 'second';
        if (currentWeek <= 40) return 'third';
        return 'postpartum';
      },

      reset: () => {
        set({
          dueDate: null,
          lmpDate: null,
          currentWeek: 0,
          currentDay: 0,
          isHighRisk: false,
          isMultiple: false,
          gestationalProgress: 0,
          stage: 'first',
        });
      },
    }),
    {
      name: 'nestbloom-pregnancy',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
