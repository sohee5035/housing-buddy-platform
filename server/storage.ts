import { properties, type Property, type InsertProperty } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Property methods
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>; // Soft delete (move to trash)
  // Trash methods
  getDeletedProperties(): Promise<Property[]>;
  restoreProperty(id: number): Promise<Property | undefined>;
  permanentDeleteProperty(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(): Promise<Property[]> {
    console.log("📊 데이터베이스에서 매물 조회 시작");
    try {
      const result = await db.select().from(properties).where(eq(properties.isDeleted, 0));
      console.log(`✅ 매물 조회 완료: ${result.length}개`);
      return result;
    } catch (error) {
      console.error("❌ 데이터베이스 조회 에러:", error);
      throw error;
    }
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ...insertProperty,
        isActive: 1,
        isDeleted: 0,
        createdAt: new Date(),
      })
      .returning();
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const [property] = await db
      .update(properties)
      .set({
        isDeleted: 1,
        isActive: 0,
        deletedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    return !!property;
  }

  async getDeletedProperties(): Promise<Property[]> {
    const result = await db.select().from(properties).where(eq(properties.isDeleted, 1));
    return result;
  }

  async restoreProperty(id: number): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set({
        isDeleted: 0,
        isActive: 1,
        deletedAt: null,
      })
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async permanentDeleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();