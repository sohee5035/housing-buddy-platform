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
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isDeleted: integer("is_deleted").default(0), // 0 = active, 1 = deleted
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  isDeleted: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
