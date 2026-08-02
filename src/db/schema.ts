import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  phoneNumber: text('phone_number'),
  accountBalance: doublePrecision('account_balance').default(0.0),
});

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  currentPrice: doublePrecision('current_price').notNull(),
  assetType: text('asset_type'),
  sector: text('sector'),
});

export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  totalValue: doublePrecision('total_value').notNull().default(0.0),
});

export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').references(() => portfolios.id).notNull(),
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  quantity: doublePrecision('quantity').notNull().default(0.0),
  averageBuyPrice: doublePrecision('average_buy_price').notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetId: integer('asset_id').references(() => assets.id).notNull(),
  orderType: text('order_type').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  priceAtExecution: doublePrecision('price_at_execution').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  orders: many(orders),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  positions: many(positions),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [positions.portfolioId],
    references: [portfolios.id],
  }),
  asset: one(assets, {
    fields: [positions.assetId],
    references: [assets.id],
  }),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  positions: many(positions),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  asset: one(assets, {
    fields: [orders.assetId],
    references: [assets.id],
  }),
}));
