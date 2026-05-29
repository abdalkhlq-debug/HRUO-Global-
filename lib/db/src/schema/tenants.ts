import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("trial"),
  logo: text("logo"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  website: text("website"),
  industry: text("industry"),
  country: text("country"),
  employeeCount: integer("employee_count").notNull().default(0),
  maxEmployees: integer("max_employees").notNull().default(50),
  maxHrUsers: integer("max_hr_users").notNull().default(5),
  maxAdminUsers: integer("max_admin_users").notNull().default(2),
  planId: integer("plan_id"),
  subscriptionStart: timestamp("subscription_start", { withTimezone: true }),
  subscriptionEnd: timestamp("subscription_end", { withTimezone: true }),
  modules: jsonb("modules").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTenantSchema = createInsertSchema(tenantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenantsTable.$inferSelect;
