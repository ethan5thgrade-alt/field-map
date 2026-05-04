import {
  pgTable,
  text,
  integer,
  timestamp,
  varchar,
  real,
  jsonb,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Users (synced from Clerk) ──
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    tier: varchar("tier", { length: 50 }).notNull().default("free"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    sellerName: varchar("seller_name", { length: 255 }),
    sellerCompany: varchar("seller_company", { length: 255 }),
    sellerSelling: text("seller_selling"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("clerk_id_idx").on(table.clerkId)]
);

// ── Usage Tracking (per user per month) ──
export const usage = pgTable(
  "usage",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
    searches: integer("searches").notNull().default(0),
    pitches: integer("pitches").notNull().default(0),
    starred: integer("starred").notNull().default(0),
  },
  (table) => [uniqueIndex("usage_user_period_idx").on(table.userId, table.period)]
);

// ── Starred Businesses ──
export const starredBusinesses = pgTable("starred_businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  businessId: varchar("business_id", { length: 255 }).notNull(),
  data: jsonb("data").notNull(), // full Business object
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Pitch History ──
export const pitches = pgTable("pitches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessCategory: varchar("business_category", { length: 255 }),
  type: varchar("type", { length: 20 }).notNull(), // "cold-call" | "email"
  preview: text("preview"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
