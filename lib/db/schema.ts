import {
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
  } from "drizzle-orm/pg-core";
  
  export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);
  
  export const chats = pgTable("chats", {
    id: serial("id").primaryKey(), // Changed to serial for auto-increment
    pdfName: text("pdf_name").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    fileKey: text("file_key").notNull().unique(),
  });
  
  export type DrizzleChat = typeof chats.$inferSelect;
  
  export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => chats.id), // Match the chats.id type
    content: text("content").notNull(),
    role: text("role").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });
  
  export const userSubscriptions = pgTable("user_subscriptions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull().unique(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
      .notNull()
      .unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 256,
    }).unique(),
    stripePriceId: varchar("stripe_price_id", { length: 256 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_ended_at"),
  });
  
  // drizzle-orm
  // drizzle-kit
  