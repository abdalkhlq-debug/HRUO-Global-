import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  active: boolean("active").notNull().default(true),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
  trainerName: text("trainer_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const trainingRecordsTable = pgTable("training_records", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  courseId: integer("course_id").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").notNull().default("enrolled"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTrainingRecordSchema = createInsertSchema(trainingRecordsTable).omit({ id: true, createdAt: true });
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type TrainingRecord = typeof trainingRecordsTable.$inferSelect;
