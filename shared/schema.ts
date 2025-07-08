import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  parentId: integer("parent_id").references(() => comments.id), // 대댓글을 위한 부모 댓글 ID
  authorName: text("author_name").notNull(),
  authorPassword: text("author_password").notNull().default("0000"), // 4자리 숫자 비밀번호
  authorContact: text("author_contact"), // 연락처 (관리자만 볼 수 있음)
  content: text("content").notNull(),
  isAdminOnly: integer("is_admin_only").default(0), // 1 = 관리자만 볼 수 있음
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isDeleted: integer("is_deleted").default(0), // 0 = active, 1 = deleted
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export const updateCommentSchema = createInsertSchema(comments).pick({
  content: true,
  authorContact: true,
  isAdminOnly: true,
}).extend({
  password: z.string().length(4, "비밀번호는 4자리 숫자여야 합니다."),
});

export const deleteCommentSchema = z.object({
  password: z.string().length(4, "비밀번호는 4자리 숫자여야 합니다."),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type DeleteComment = z.infer<typeof deleteCommentSchema>;
export type Comment = typeof comments.$inferSelect;
