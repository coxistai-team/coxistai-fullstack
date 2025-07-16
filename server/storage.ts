import { users, documents, type User, type InsertUser, type UpdateUserProfile, type Document, type InsertDocument } from "@shared/schema";

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
}

export const storage = new DatabaseStorage();
