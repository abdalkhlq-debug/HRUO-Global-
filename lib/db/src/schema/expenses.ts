import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const expenseCategoriesTable = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  active: boolean("active").notNull().default(true),
  maxPerClaim: numeric("max_per_claim", { precision: 12, scale: 2 }),
  yearlyLimit: numeric("yearly_limit", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategoriesTable).omit({ id: true, createdAt: true });
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategoriesTable.$inferSelect;

export const expenseClaimsTable = pgTable("expense_claims", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  categoryId: integer("category_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  reason: text("reason"),
  fromDate: text("from_date"),
  toDate: text("to_date"),
  status: text("status").notNull().default("pending"),
  approverRemark: text("approver_remark"),
  approvedBy: integer("approved_by"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertExpenseClaimSchema = createInsertSchema(expenseClaimsTable).omit({ id: true, submittedAt: true, updatedAt: true });
export type InsertExpenseClaim = z.infer<typeof insertExpenseClaimSchema>;
export type ExpenseClaim = typeof expenseClaimsTable.$inferSelect;
