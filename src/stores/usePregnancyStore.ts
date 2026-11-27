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
  setRiskFlags: (isHighRisk: boolean, isMultiple: boolean) => void;
  calculateStage: () => PregnancyStage;
  reset: () => void;
}

const stageFromWeek = (week: number): PregnancyStage => {
  if (week <= 13) return 'first';
  if (week <= 27) return 'second';
  if (week <= 40) return 'third';
  return 'postpartum';
};

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

  // Days already pregnant = 280 - days remaining until due date.
  const daysPregnant = Math.max(0, Math.min(280, 280 - diffDays));
  const currentWeek = Math.floor(daysPregnant / 7);
  const currentDay = daysPregnant % 7;
  const gestationalProgress = daysPregnant / 7; // 0 → 40 weeks

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
          stage: stageFromWeek(currentWeek),
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
          stage: stageFromWeek(currentWeek),
        });
      },

      setProgress: (week, day) => {
        const gestationalProgress = Math.min(40, Math.max(0, week + day / 7));
        set({ currentWeek: week, currentDay: day, gestationalProgress });
      },

      setRiskFlags: (isHighRisk, isMultiple) => set({ isHighRisk, isMultiple }),

      calculateStage: () => {
        return stageFromWeek(get().currentWeek);
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
      // Dates are JSON-serialized as strings by localStorage. Revive them so
      // code can keep calling Date methods after a reload.
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if ((key === 'dueDate' || key === 'lmpDate') && typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
          }
          return value;
        },
      }),
    }
  )
);
