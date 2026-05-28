import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  employeeId: integer("employee_id").notNull(),
  targetDate: text("target_date"),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("0"),
  progress: numeric("progress", { precision: 5, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("not_started"),
  type: text("type").notNull().default("individual"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  reviewerId: integer("reviewer_id"),
  period: text("period").notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull(),
  strengths: text("strengths"),
  improvements: text("improvements"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
