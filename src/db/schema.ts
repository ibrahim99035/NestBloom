import { pgTable, text, timestamp, integer, boolean, jsonb, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  image: text('image'),
  verificationToken: text('verification_token'),
  verificationTokenExpires: timestamp('verification_token_expires'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pregnancies = pgTable('pregnancies', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  dueDate: date('due_date').notNull(),
  lmpDate: date('lmp_date'),
  currentWeek: integer('current_week'),
  currentDay: integer('current_day'),
  isHighRisk: boolean('is_high_risk').default(false),
  isMultiple: boolean('is_multiple').default(false),
  preferredHospitalId: text('preferred_hospital_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const avatarConfigs = pgTable('avatar_configs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  skinTone: text('skin_tone'),
  hairStyle: text('hair_style'),
  hairColor: text('hair_color'),
  faceShape: text('face_shape'),
  bodyType: text('body_type'),
  currentOutfit: text('current_outfit'),
  unlockedItems: jsonb('unlocked_items').$type<string[]>().default([]),
  morphOverrides: jsonb('morph_overrides'),
});

export const dailyProgress = pgTable('daily_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  xpEarned: integer('xp_earned').default(0),
  questsCompleted: jsonb('quests_completed').$type<string[]>().default([]),
  waterCups: integer('water_cups').default(0),
  vitaminTaken: boolean('vitamin_taken').default(false),
  mood: integer('mood'),
  notes: text('notes'),
});

export const trackers = pgTable('trackers', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'kick' | 'contraction' | 'symptom' | 'weight'
  value: jsonb('value'),
  recordedAt: timestamp('recorded_at').defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  content: text('content'),
  mood: integer('mood'),
  photoUrls: jsonb('photo_urls').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});
