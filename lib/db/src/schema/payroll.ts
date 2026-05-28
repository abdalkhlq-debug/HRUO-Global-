import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const payslipsTable = pgTable("payslips", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  period: text("period").notNull(),
  grossSalary: numeric("gross_salary", { precision: 12, scale: 2 }).notNull(),
  netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),
  totalDeductions: numeric("total_deductions", { precision: 12, scale: 2 }).notNull().default("0"),
  totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }).notNull().default("0"),
  socialInsurance: numeric("social_insurance", { precision: 12, scale: 2 }).notNull().default("0"),
  incomeTax: numeric("income_tax", { precision: 12, scale: 2 }).notNull().default("0"),
  bonuses: numeric("bonuses", { precision: 12, scale: 2 }).default("0"),
  extraDeductions: numeric("extra_deductions", { precision: 12, scale: 2 }).default("0"),
  status: text("status").notNull().default("draft"),
  currency: text("currency").notNull().default("USD"),
  remarks: text("remarks"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPayslipSchema = createInsertSchema(payslipsTable).omit({ id: true, createdAt: true });
export type InsertPayslip = z.infer<typeof insertPayslipSchema>;
export type Payslip = typeof payslipsTable.$inferSelect;
