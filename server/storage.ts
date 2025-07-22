import { users, documents, presentations, calendar_events, community_posts, community_replies, community_likes, community_groups, community_group_members, type User, type InsertUser, type UpdateUserProfile, type Document, type InsertDocument, type Presentation, type InsertPresentation, type CalendarEvent, type InsertCalendarEvent, type CommunityPost, type InsertCommunityPost, type CommunityReply, type InsertCommunityReply, type CommunityLike, type InsertCommunityLike, type CommunityGroup, type InsertCommunityGroup, type CommunityGroupMember, type InsertCommunityGroupMember, notes } from "@shared/schema";

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
  getCommunityPosts(): Promise<any[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(data: InsertCommunityPost & { user_id: number }): Promise<CommunityPost>;
  updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost>;
  deleteCommunityPost(id: number, userId: number): Promise<boolean>;

  // Community replies
  getCommunityReplies(postId: number): Promise<CommunityReply[]>;
  getCommunityReply(id: number): Promise<CommunityReply | undefined>;
  createCommunityReply(data: InsertCommunityReply & { user_id: number; post_id: number }): Promise<CommunityReply>;
  updateCommunityReply(id: number, updates: Partial<CommunityReply>): Promise<CommunityReply>;
  deleteCommunityReply(id: number, userId: number): Promise<boolean>;

  // Community likes
  togglePostLike(userId: number, postId: number): Promise<{ liked: boolean; likesCount: number; }>;
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

  // Notes CRUD
  getNotes(userId: number): Promise<any[]>;
  createNote(note: any): Promise<any>;
  getNote(noteId: number, userId: number): Promise<any | undefined>;
  updateNote(noteId: number, userId: number, updates: any): Promise<any>;
  deleteNote(noteId: number, userId: number): Promise<boolean>;

  getTopUsers(sort: string, limit: number): Promise<User[]>;
}

import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "./db";
import { count } from "drizzle-orm";

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

  async getCommunityPosts(): Promise<any[]> {
    const posts = await db.select({
      id: community_posts.id,
      title: community_posts.title,
      content: community_posts.content,
      category: community_posts.category,
      tags: community_posts.tags,
      createdAt: community_posts.created_at,
      author: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
      },
    })
    .from(community_posts)
    .leftJoin(users, eq(community_posts.user_id, users.id))
    .orderBy(desc(community_posts.created_at));

    if (!posts.length) {
      return [];
    }

    const postIds = posts.map((p: any) => p.id);

    const replies = await db.select({
      id: community_replies.id,
      content: community_replies.content,
      createdAt: community_replies.created_at,
      postId: community_replies.post_id,
      author: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
      },
    })
    .from(community_replies)
    .leftJoin(users, eq(community_replies.user_id, users.id))
    .where(inArray(community_replies.post_id, postIds))
    .orderBy(desc(community_replies.created_at));

    const likes = await db.select()
      .from(community_likes)
      .where(inArray(community_likes.post_id, postIds));

    return posts.map((post: any) => ({
      ...post,
      replies: replies.filter((r: any) => r.postId === post.id),
      likes: likes.filter((l: any) => l.post_id === post.id),
      likesCount: likes.filter((l: any) => l.post_id === post.id).length,
    }));
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
  async deleteCommunityPost(id: number, userId: number): Promise<boolean> {
    // Delete likes for the post
    await db.delete(community_likes).where(eq(community_likes.post_id, id));
    // Delete replies for the post
    await db.delete(community_replies).where(eq(community_replies.post_id, id));
    // Delete the post (only if owner)
    const result = await db.delete(community_posts).where(and(eq(community_posts.id, id), eq(community_posts.user_id, userId)));
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
  async createCommunityReply(data: InsertCommunityReply & { user_id: number; post_id: number }): Promise<any> {
    const [created] = await db.insert(community_replies).values(data).returning();
    // Fetch the reply with author info
    const [replyWithAuthor] = await db.select({
      id: community_replies.id,
      content: community_replies.content,
      createdAt: community_replies.created_at,
      postId: community_replies.post_id,
      author: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
      },
    })
    .from(community_replies)
    .leftJoin(users, eq(community_replies.user_id, users.id))
    .where(eq(community_replies.id, created.id));
    return replyWithAuthor;
  }
  async updateCommunityReply(id: number, updates: Partial<CommunityReply>): Promise<CommunityReply> {
    const [updated] = await db.update(community_replies).set({ ...updates, updated_at: new Date() }).where(eq(community_replies.id, id)).returning();
    return updated;
  }
  async deleteCommunityReply(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(community_replies).where(and(eq(community_replies.id, id), eq(community_replies.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Community likes
  async togglePostLike(userId: number, postId: number): Promise<{ liked: boolean; likesCount: number; }> {
    const existingLike = await db.select().from(community_likes).where(and(eq(community_likes.user_id, userId), eq(community_likes.post_id, postId)));

    let liked = false;
    if (existingLike.length > 0) {
      // Unlike
      await db.delete(community_likes).where(and(eq(community_likes.user_id, userId), eq(community_likes.post_id, postId)));
      liked = false;
    } else {
      // Like
      await db.insert(community_likes).values({ user_id: userId, post_id: postId });
      liked = true;
    }

    const likesCountResult = await db.select({ count: count() }).from(community_likes).where(eq(community_likes.post_id, postId));
    const likesCount = likesCountResult[0]?.count ?? 0;

    return { liked, likesCount };
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

  // Notes CRUD
  async getNotes(userId: number) {
    return await db.select().from(notes).where(eq(notes.user_id, userId));
  }

  async createNote(note: any) {
    // attachments: string[] is stored as JSON string in a text column (add migration if needed)
    const [created] = await db.insert(notes).values({
      ...note,
      attachments: JSON.stringify(note.attachments || []),
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();
    // Parse attachments for frontend
    return { ...created, attachments: JSON.parse(created.attachments || "[]") };
  }

  async getNote(noteId: number, userId: number) {
    const [note] = await db.select().from(notes).where(and(eq(notes.id, noteId), eq(notes.user_id, userId)));
    if (!note) return undefined;
    return { ...note, attachments: JSON.parse(note.attachments || "[]") };
  }

  async updateNote(noteId: number, userId: number, updates: any) {
    const [updated] = await db.update(notes)
      .set({
        ...updates,
        attachments: JSON.stringify(updates.attachments || []),
        updated_at: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.user_id, userId)))
      .returning();
    return { ...updated, attachments: JSON.parse(updated.attachments || "[]") };
  }

  async deleteNote(noteId: number, userId: number) {
    await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.user_id, userId)));
    return true;
  }

  async getTopUsers(sort: string = "reputation", limit: number = 5) {
    // Sort by reputation (descending) and limit
    const orderBy = sort === "reputation" ? users.reputation : users.id;
    const topUsers = await db.select().from(users).orderBy(orderBy, "desc").limit(limit);
    return topUsers;
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
