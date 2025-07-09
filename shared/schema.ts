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

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID (string)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  parentId: integer("parent_id"), // 대댓글을 위한 부모 댓글 ID - self reference 제거
  userId: varchar("user_id").references(() => users.id), // 로그인한 사용자 ID (nullable for anonymous)
  authorName: text("author_name").notNull(),
  authorPassword: text("author_password").default("0000"), // 4자리 숫자 비밀번호 (익명 댓글용)
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
}).extend({
  // authorPassword는 로그인한 사용자의 경우 선택사항으로 만듦
  authorPassword: z.string().optional(),
});

export const updateCommentSchema = createInsertSchema(comments).pick({
  content: true,
  authorContact: true,
  isAdminOnly: true,
}).extend({
  password: z.string().optional(), // 로그인한 사용자는 비밀번호 불필요
});

export const deleteCommentSchema = z.object({
  password: z.string().optional(), // 로그인한 사용자는 비밀번호 불필요
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type DeleteComment = z.infer<typeof deleteCommentSchema>;
export type Comment = typeof comments.$inferSelect;
