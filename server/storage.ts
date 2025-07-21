import { users, documents, presentations, calendar_events, community_posts, community_replies, community_likes, community_groups, community_group_members, type User, type InsertUser, type UpdateUserProfile, type Document, type InsertDocument, type Presentation, type InsertPresentation, type CalendarEvent, type InsertCalendarEvent, type CommunityPost, type InsertCommunityPost, type CommunityReply, type InsertCommunityReply, type CommunityLike, type InsertCommunityLike, type CommunityGroup, type InsertCommunityGroup, type CommunityGroupMember, type InsertCommunityGroupMember } from "@shared/schema";

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

  // Community post operations
  getCommunityPosts(userId: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(data: InsertCommunityPost & { user_id: number }): Promise<CommunityPost>;
  updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost>;
  deleteCommunityPost(id: number): Promise<boolean>;

  // Community replies
  getCommunityReplies(postId: number): Promise<CommunityReply[]>;
  getCommunityReply(id: number): Promise<CommunityReply | undefined>;
  createCommunityReply(data: InsertCommunityReply & { user_id: number; post_id: number }): Promise<CommunityReply>;
  updateCommunityReply(id: number, updates: Partial<CommunityReply>): Promise<CommunityReply>;
  deleteCommunityReply(id: number): Promise<boolean>;

  // Community likes
  likePost(userId: number, postId: number): Promise<CommunityLike>;
  unlikePost(userId: number, postId: number): Promise<boolean>;
  likeReply(userId: number, replyId: number): Promise<CommunityLike>;
  unlikeReply(userId: number, replyId: number): Promise<boolean>;
  getLikesForPost(postId: number): Promise<CommunityLike[]>;
  getLikesForReply(replyId: number): Promise<CommunityLike[]>;

  // Community groups
  getCommunityGroups(): Promise<CommunityGroup[]>;
  getCommunityGroup(id: number): Promise<CommunityGroup | undefined>;
  createCommunityGroup(data: InsertCommunityGroup): Promise<CommunityGroup>;
  updateCommunityGroup(id: number, updates: Partial<CommunityGroup>): Promise<CommunityGroup>;
  deleteCommunityGroup(id: number): Promise<boolean>;

  // Community group members
  joinCommunityGroup(userId: number, groupId: number): Promise<CommunityGroupMember>;
  leaveCommunityGroup(userId: number, groupId: number): Promise<boolean>;
  getGroupMembers(groupId: number): Promise<CommunityGroupMember[]>;
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

  async getCommunityPosts(userId: number): Promise<CommunityPost[]> {
    return await db.select().from(community_posts).where(eq(community_posts.user_id, userId));
  }
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(community_posts).where(eq(community_posts.id, id));
    return post || undefined;
  }
  async createCommunityPost(data: InsertCommunityPost & { user_id: number }): Promise<CommunityPost> {
    const [created] = await db.insert(community_posts).values(data).returning();
    return created;
  }
  async updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost> {
    const [updated] = await db.update(community_posts).set({ ...updates, updated_at: new Date() }).where(eq(community_posts.id, id)).returning();
    return updated;
  }
  async deleteCommunityPost(id: number): Promise<boolean> {
    const result = await db.delete(community_posts).where(eq(community_posts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Community replies
  async getCommunityReplies(postId: number): Promise<CommunityReply[]> {
    return await db.select().from(community_replies).where(eq(community_replies.post_id, postId));
  }
  async getCommunityReply(id: number): Promise<CommunityReply | undefined> {
    const [reply] = await db.select().from(community_replies).where(eq(community_replies.id, id));
    return reply || undefined;
  }
  async createCommunityReply(data: InsertCommunityReply & { user_id: number; post_id: number }): Promise<CommunityReply> {
    const [created] = await db.insert(community_replies).values(data).returning();
    return created;
  }
  async updateCommunityReply(id: number, updates: Partial<CommunityReply>): Promise<CommunityReply> {
    const [updated] = await db.update(community_replies).set({ ...updates, updated_at: new Date() }).where(eq(community_replies.id, id)).returning();
    return updated;
  }
  async deleteCommunityReply(id: number): Promise<boolean> {
    const result = await db.delete(community_replies).where(eq(community_replies.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Community likes
  async likePost(userId: number, postId: number): Promise<CommunityLike> {
    const [like] = await db.insert(community_likes).values({ user_id: userId, post_id: postId }).onConflictDoNothing().returning();
    return like;
  }
  async unlikePost(userId: number, postId: number): Promise<boolean> {
    const result = await db.delete(community_likes).where(eq(community_likes.user_id, userId)).where(eq(community_likes.post_id, postId));
    return (result.rowCount || 0) > 0;
  }
  async likeReply(userId: number, replyId: number): Promise<CommunityLike> {
    const [like] = await db.insert(community_likes).values({ user_id: userId, reply_id: replyId }).onConflictDoNothing().returning();
    return like;
  }
  async unlikeReply(userId: number, replyId: number): Promise<boolean> {
    const result = await db.delete(community_likes).where(eq(community_likes.user_id, userId)).where(eq(community_likes.reply_id, replyId));
    return (result.rowCount || 0) > 0;
  }
  async getLikesForPost(postId: number): Promise<CommunityLike[]> {
    return await db.select().from(community_likes).where(eq(community_likes.post_id, postId));
  }
  async getLikesForReply(replyId: number): Promise<CommunityLike[]> {
    return await db.select().from(community_likes).where(eq(community_likes.reply_id, replyId));
  }

  // Community groups
  async getCommunityGroups(): Promise<CommunityGroup[]> {
    return await db.select().from(community_groups);
  }
  async getCommunityGroup(id: number): Promise<CommunityGroup | undefined> {
    const [group] = await db.select().from(community_groups).where(eq(community_groups.id, id));
    return group || undefined;
  }
  async createCommunityGroup(data: InsertCommunityGroup): Promise<CommunityGroup> {
    const [created] = await db.insert(community_groups).values(data).returning();
    return created;
  }
  async updateCommunityGroup(id: number, updates: Partial<CommunityGroup>): Promise<CommunityGroup> {
    const [updated] = await db.update(community_groups).set({ ...updates, updated_at: new Date() }).where(eq(community_groups.id, id)).returning();
    return updated;
  }
  async deleteCommunityGroup(id: number): Promise<boolean> {
    const result = await db.delete(community_groups).where(eq(community_groups.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Community group members
  async joinCommunityGroup(userId: number, groupId: number): Promise<CommunityGroupMember> {
    const [member] = await db.insert(community_group_members).values({ user_id: userId, group_id: groupId }).onConflictDoNothing().returning();
    return member;
  }
  async leaveCommunityGroup(userId: number, groupId: number): Promise<boolean> {
    const result = await db.delete(community_group_members).where(eq(community_group_members.user_id, userId)).where(eq(community_group_members.group_id, groupId));
    return (result.rowCount || 0) > 0;
  }
  async getGroupMembers(groupId: number): Promise<CommunityGroupMember[]> {
    return await db.select().from(community_group_members).where(eq(community_group_members.group_id, groupId));
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
