import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
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
  reputation: integer("reputation").notNull().default(0), // Add this line for leaderboard
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
  attachments: text('attachments').default('[]'), // Add this line for file URLs
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const presentations = pgTable('presentations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  topic: varchar('topic', { length: 255 }).notNull(),
  json_data: jsonb('json_data').notNull(),
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

export const community_posts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  tags: varchar('tags', { length: 32 }).array(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  edited_at: timestamp('edited_at'),
  deleted_at: timestamp('deleted_at'),
  is_deleted: boolean('is_deleted').notNull().default(false),
  likes: integer('likes').notNull().default(0),
  replies: integer('replies').notNull().default(0),
  views: integer('views').notNull().default(0),
  is_pinned: boolean('is_pinned').notNull().default(false),
});

export const community_replies = pgTable('community_replies', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull().references(() => community_posts.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  parent_reply_id: integer('parent_reply_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  edited_at: timestamp('edited_at'),
  deleted_at: timestamp('deleted_at'),
  is_deleted: boolean('is_deleted').notNull().default(false),
});

export const community_likes = pgTable('community_likes', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  post_id: integer('post_id').references(() => community_posts.id),
  reply_id: integer('reply_id').references(() => community_replies.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const community_groups = pgTable('community_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const community_group_members = pgTable('community_group_members', {
  id: serial('id').primaryKey(),
  group_id: integer('group_id').notNull().references(() => community_groups.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  joined_at: timestamp('joined_at').notNull().defaultNow(),
});

export const calendar_tasks = pgTable('calendar_tasks', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  completed: boolean('completed').notNull().default(false),
  date: text('date').notNull(), // ISO date string (yyyy-mm-dd)
  priority: varchar('priority', { length: 16 }).notNull().default('medium'), // 'low' | 'medium' | 'high'
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
  topic: true,
  json_data: true,
});
 
export const insertCalendarTaskSchema = createInsertSchema(calendar_tasks).pick({
  title: true,
  date: true,
  priority: true,
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

export type CommunityPost = typeof community_posts.$inferSelect;
export type InsertCommunityPost = typeof community_posts.$inferInsert;
export type CommunityReply = typeof community_replies.$inferSelect;
export type InsertCommunityReply = typeof community_replies.$inferInsert;
export type CommunityLike = typeof community_likes.$inferSelect;
export type InsertCommunityLike = typeof community_likes.$inferInsert;
export type CommunityGroup = typeof community_groups.$inferSelect;
export type InsertCommunityGroup = typeof community_groups.$inferInsert;
export type CommunityGroupMember = typeof community_group_members.$inferSelect;
export type InsertCommunityGroupMember = typeof community_group_members.$inferInsert;

export type CalendarTask = typeof calendar_tasks.$inferSelect;
export type InsertCalendarTask = z.infer<typeof insertCalendarTaskSchema>;
