import { users, documents, presentations, calendar_events, type User, type InsertUser, type UpdateUserProfile, type Document, type InsertDocument, type Presentation, type InsertPresentation, type CalendarEvent, type InsertCalendarEvent } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profile: UpdateUserProfile): Promise<User>;
  
  // Document operations
  getDocuments(userId?: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByShareCode(shareCode: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument & { userId: number }): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Presentation operations
  getPresentations(userId: number): Promise<Presentation[]>;
  getPresentation(id: number): Promise<Presentation | undefined>;
  createPresentation(data: InsertPresentation & { user_id: number }): Promise<Presentation>;
  updatePresentation(id: number, updates: Partial<Presentation>): Promise<Presentation>;
  deletePresentation(id: number): Promise<boolean>;

  // Calendar event operations
  getCalendarEvents(userId: number): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(data: InsertCalendarEvent & { user_id: number }): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<boolean>;
}

import { eq } from "drizzle-orm";
import { db } from "./db";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProfile(id: number, profile: UpdateUserProfile): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getDocuments(userId?: number): Promise<Document[]> {
    if (userId) {
      return await db.select().from(documents).where(eq(documents.userId, userId));
    }
    return await db.select().from(documents).where(eq(documents.isPublic, true));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentByShareCode(shareCode: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.shareCode, shareCode));
    return document || undefined;
  }

  async createDocument(document: InsertDocument & { userId: number }): Promise<Document> {
    const shareCode = Math.random().toString(36).substring(2, 15);
    const [created] = await db
      .insert(documents)
      .values({ ...document, shareCode })
      .returning();
    return created;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [updated] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPresentations(userId: number): Promise<Presentation[]> {
    return await db.select().from(presentations).where(eq(presentations.user_id, userId));
  }
  async getPresentation(id: number): Promise<Presentation | undefined> {
    const [presentation] = await db.select().from(presentations).where(eq(presentations.id, id));
    return presentation || undefined;
  }
  async createPresentation(data: InsertPresentation & { user_id: number }): Promise<Presentation> {
    const [created] = await db.insert(presentations).values(data).returning();
    return created;
  }
  async updatePresentation(id: number, updates: Partial<Presentation>): Promise<Presentation> {
    const [updated] = await db.update(presentations).set({ ...updates, updated_at: new Date() }).where(eq(presentations.id, id)).returning();
    return updated;
  }
  async deletePresentation(id: number): Promise<boolean> {
    const result = await db.delete(presentations).where(eq(presentations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return await db.select().from(calendar_events).where(eq(calendar_events.user_id, userId));
  }
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendar_events).where(eq(calendar_events.id, id));
    return event || undefined;
  }
  async createCalendarEvent(data: InsertCalendarEvent & { user_id: number }): Promise<CalendarEvent> {
    const [created] = await db.insert(calendar_events).values(data).returning();
    return created;
  }
  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const [updated] = await db.update(calendar_events).set({ ...updates, updated_at: new Date() }).where(eq(calendar_events.id, id)).returning();
    return updated;
  }
  async deleteCalendarEvent(id: number): Promise<boolean> {
    const result = await db.delete(calendar_events).where(eq(calendar_events.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ password: newPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
