import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaveTypesTable = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  color: text("color").default("#2563EB"),
  paid: boolean("paid").notNull().default(true),
  active: boolean("active").notNull().default(true),
  daysPerYear: numeric("days_per_year", { precision: 5, scale: 1 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeaveTypeSchema = createInsertSchema(leaveTypesTable).omit({ id: true, createdAt: true });
export type InsertLeaveType = z.infer<typeof insertLeaveTypeSchema>;
export type LeaveType = typeof leaveTypesTable.$inferSelect;

export const leaveRequestsTable = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  days: numeric("days", { precision: 5, scale: 1 }).notNull().default("0"),
  status: text("status").notNull().default("pending"),
  reason: text("reason"),
  approverRemark: text("approver_remark"),
  isEmergency: boolean("is_emergency").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequestsTable.$inferSelect;

export const leaveBalancesTable = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  entitled: numeric("entitled", { precision: 5, scale: 1 }).notNull().default("0"),
  taken: numeric("taken", { precision: 5, scale: 1 }).notNull().default("0"),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeaveBalanceSchema = createInsertSchema(leaveBalancesTable).omit({ id: true, createdAt: true });
export type InsertLeaveBalance = z.infer<typeof insertLeaveBalanceSchema>;
export type LeaveBalance = typeof leaveBalancesTable.$inferSelect;
