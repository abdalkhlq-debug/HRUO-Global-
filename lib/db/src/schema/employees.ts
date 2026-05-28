import { pgTable, serial, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  employeeNumber: text("employee_number").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  photo: text("photo"),
  gender: text("gender"),
  birthDate: text("birth_date"),
  nationality: text("nationality"),
  nationalId: text("national_id"),
  jobTitle: text("job_title"),
  departmentId: integer("department_id"),
  branchId: integer("branch_id"),
  managerId: integer("manager_id"),
  dateJoined: text("date_joined"),
  probationEnd: text("probation_end"),
  employmentType: text("employment_type").default("permanent"),
  status: text("status").notNull().default("active"),
  basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }),
  currency: text("currency").default("USD"),
  bankName: text("bank_name"),
  iban: text("iban"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
