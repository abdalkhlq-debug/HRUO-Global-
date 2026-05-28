import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attendanceRecordsTable = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  date: text("date").notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  totalHours: numeric("total_hours", { precision: 5, scale: 2 }),
  overtime: numeric("overtime", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("present"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  ipAddress: text("ip_address"),
  selfieUrl: text("selfie_url"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecordsTable).omit({ id: true, createdAt: true });
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type AttendanceRecord = typeof attendanceRecordsTable.$inferSelect;
