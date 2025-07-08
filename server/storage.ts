import { properties, comments, type Property, type InsertProperty, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
  
  // Comment methods
  getComments(propertyId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(): Promise<Property[]> {
    const result = await db.select().from(properties).where(eq(properties.isDeleted, 0));
    
    // 메인 화면용으로 Cloudinary URL만 포함 (base64는 제외)
    const propertiesWithThumbnail = result.map(prop => {
      let thumbnailPhoto: string[] = [];
      
      if (prop.photos && Array.isArray(prop.photos) && prop.photos.length > 0) {
        const firstPhoto = prop.photos[0];
        // Cloudinary URL인 경우만 포함
        if (firstPhoto && firstPhoto.startsWith('https://res.cloudinary.com/')) {
          thumbnailPhoto = [firstPhoto];
        }
      }
      
      return {
        ...prop,
        photos: thumbnailPhoto
      };
    });
    
    return propertiesWithThumbnail;
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

  // Comment methods
  async getComments(propertyId: number): Promise<Comment[]> {
    const result = await db
      .select()
      .from(comments)
      .where(and(eq(comments.propertyId, propertyId), eq(comments.isDeleted, 0)))
      .orderBy(desc(comments.createdAt));
    return result;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [result] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return result;
  }

  async deleteComment(id: number): Promise<boolean> {
    const [result] = await db
      .update(comments)
      .set({ isDeleted: 1 })
      .where(eq(comments.id, id))
      .returning();
    return !!result;
  }
}

export const storage = new DatabaseStorage();