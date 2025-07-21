import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  location: text("location"),
  timezone: text("timezone"),
  avatar: text("avatar"),
  dateOfBirth: text("date_of_birth"),
  occupation: text("occupation"),
  company: text("company"),
  theme: text("theme").default("dark"),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  weeklyDigest: boolean("weekly_digest").default(true),
  language: text("language").default("en"),
  publicProfile: boolean("public_profile").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  content: text("content"),
  tags: text("tags").array().default([]),
  userId: integer("user_id").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  shareCode: text("share_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tags: varchar('tags', { length: 64 }).array(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const presentations = pgTable('presentations', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  slides: text('slides').notNull(), // store JSON string
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const calendar_events = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: text('date').notNull(), // ISO date string
  time: varchar('time', { length: 16 }).notNull(),
  duration: integer('duration').notNull(),
  location: varchar('location', { length: 255 }),
  type: varchar('type', { length: 32 }).notNull(),
  color: varchar('color', { length: 32 }).notNull(),
  reminder: integer('reminder'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  notes: many(notes),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.user_id],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  bio: true,
  location: true,
  timezone: true,
  avatar: true,
  dateOfBirth: true,
  occupation: true,
  company: true,
  theme: true,
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: true,
  weeklyDigest: true,
  language: true,
  publicProfile: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  filename: true,
  fileType: true,
  content: true,
  tags: true,
  isPublic: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  tags: true,
});

export const insertPresentationSchema = createInsertSchema(presentations).pick({
  title: true,
  slides: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;

export type CalendarEvent = typeof calendar_events.$inferSelect;
export type InsertCalendarEvent = typeof calendar_events.$inferInsert;
