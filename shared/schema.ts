import { pgTable, text, serial, integer, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  address: text("address").notNull(),
  deposit: integer("deposit").notNull(),
  monthlyRent: integer("monthly_rent").notNull(),
  maintenanceFee: integer("maintenance_fee"), // 관리비 (null이면 "알 수 없음")
  description: text("description").notNull(),
  otherInfo: text("other_info"), // 기타 입력 (옵션 필드)
  photos: text("photos").array().default([]),
  originalUrl: text("original_url"), // 원본 페이지 링크
  category: text("category").default("기타"), // 카테고리
  isActive: integer("is_active").default(1),
  isDeleted: integer("is_deleted").default(0), // 0 = active, 1 = deleted (in trash)
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(), // hashed password
  name: varchar("name", { length: 100 }).notNull(), // 사용자 이름
  isEmailVerified: integer("is_email_verified").default(0), // 0 = not verified, 1 = verified
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailVerificationToken: true,
}).extend({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자리 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자리 이상이어야 합니다"),
});

export const loginUserSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

// Comments table (members only)
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  parentId: integer("parent_id"), // 대댓글을 위한 부모 댓글 ID - self reference 제거
  userId: integer("user_id").notNull().references(() => users.id), // 로그인한 사용자 ID (required for members)
  authorName: text("author_name").notNull(),
  authorContact: text("author_contact"), // 연락처 (관리자만 볼 수 있음)
  content: text("content").notNull(),
  isAdminOnly: integer("is_admin_only").default(0), // 1 = 관리자만 볼 수 있음
  adminMemo: text("admin_memo"), // 관리자 전용 메모
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isDeleted: integer("is_deleted").default(0), // 0 = active, 1 = deleted
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [comments.propertyId],
    references: [properties.id],
  }),
}));

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  userId: true, // 서버에서 자동으로 할당
});

export const updateCommentSchema = createInsertSchema(comments).pick({
  content: true,
  authorContact: true,
  isAdminOnly: true,
});

export const deleteCommentSchema = z.object({
  // 회원 전용에서는 비밀번호 필요 없음
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type DeleteComment = z.infer<typeof deleteCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Favorites table for user property favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
