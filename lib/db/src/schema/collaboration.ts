import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").notNull().default(false),
  announcementDate: text("announcement_date"),
  authorId: integer("author_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;

export const discussionsTable = pgTable("discussions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: integer("author_id").notNull(),
  scope: text("scope").notNull().default("organization"),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiscussionSchema = createInsertSchema(discussionsTable).omit({ id: true, createdAt: true });
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussionsTable.$inferSelect;

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  sharedWith: text("shared_with").notNull().default("all"),
  uploadedBy: integer("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: integer("assignee_id"),
  dueDate: text("due_date"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("todo"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
