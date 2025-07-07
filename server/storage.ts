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
    const result = await db.select({
      id: properties.id,
      title: properties.title,
      address: properties.address,
      deposit: properties.deposit,
      monthlyRent: properties.monthlyRent,
      maintenanceFee: properties.maintenanceFee,
      description: properties.description,
      otherInfo: properties.otherInfo,
      originalUrl: properties.originalUrl,
      category: properties.category,
      isActive: properties.isActive,
      isDeleted: properties.isDeleted,
      deletedAt: properties.deletedAt,
      createdAt: properties.createdAt,
      // photos 필드 제외 - 별도 API로 제공
    }).from(properties).where(eq(properties.isDeleted, 0));
    
    // photos 필드에 빈 배열 추가
    const propertiesWithEmptyPhotos = result.map(prop => ({
      ...prop,
      photos: [] as string[]
    }));
    
    return propertiesWithEmptyPhotos;
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