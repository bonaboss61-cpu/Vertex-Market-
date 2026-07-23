import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, doublePrecision, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('fullName'),
  balanceDemo: doublePrecision('balance_demo').default(10000.0).notNull(),
  balanceLive: doublePrecision('balance_live').default(0.0).notNull(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  kycStatus: text('kyc_status').default('UNVERIFIED').notNull(),
  hasClaimedInitialBonus: boolean('has_claimed_initial_bonus').default(false).notNull(),
  adminBalanceVersion: integer('admin_balance_version').default(0).notNull(),
  joinedTournaments: jsonb('joined_tournaments').default([]),
  tournamentScores: jsonb('tournament_scores').default({}),
  weeklyProfit: doublePrecision('weekly_profit').default(0.0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  type: text('type').notNull(),
  amount: doublePrecision('amount').notNull(),
  bonus: doublePrecision('bonus').default(0.0),
  status: text('status').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  payoutCut: doublePrecision('payout_cut').default(0.0)
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  adminPasscode: text('admin_passcode').default('admin123').notNull(),
  platformProfit: doublePrecision('platform_profit').default(0.0).notNull(),
  activeTournamentId: text('active_tournament_id').default('tourney_weekend_1').notNull()
});
