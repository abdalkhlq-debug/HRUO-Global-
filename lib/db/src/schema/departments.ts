import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  active: boolean("active").notNull().default(true),
  parentId: integer("parent_id"),
  headId: integer("head_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ id: true, createdAt: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;

export const branchesTable = pgTable("branches", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  active: boolean("active").notNull().default(true),
  address: text("address"),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBranchSchema = createInsertSchema(branchesTable).omit({ id: true, createdAt: true });
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branchesTable.$inferSelect;

export const jobLevelsTable = pgTable("job_levels", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  active: boolean("active").notNull().default(true),
  level: text("level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobLevelSchema = createInsertSchema(jobLevelsTable).omit({ id: true, createdAt: true });
export type InsertJobLevel = z.infer<typeof insertJobLevelSchema>;
export type JobLevel = typeof jobLevelsTable.$inferSelect;
