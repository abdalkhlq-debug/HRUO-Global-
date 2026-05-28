import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  department: text("department"),
  location: text("location"),
  type: text("type").default("full_time"),
  status: text("status").notNull().default("draft"),
  description: text("description"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

export const applicantsTable = pgTable("applicants", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  jobId: integer("job_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  stage: text("stage").notNull().default("applied"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  notes: text("notes"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertApplicantSchema = createInsertSchema(applicantsTable).omit({ id: true, appliedAt: true, updatedAt: true });
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Applicant = typeof applicantsTable.$inferSelect;
