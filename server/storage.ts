import { properties, type Property, type InsertProperty } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// 간단한 메모리 캐시
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30초

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

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
    const cacheKey = 'all-properties';
    const cached = getFromCache<Property[]>(cacheKey);
    if (cached) {
      console.log('[DB] getProperties - served from cache');
      return cached;
    }

    const startTime = Date.now();
    try {
      const result = await db.select().from(properties).where(eq(properties.isDeleted, 0));
      const duration = Date.now() - startTime;
      console.log(`[DB] getProperties took ${duration}ms`);
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[DB] getProperties error:', error);
      throw error;
    }
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const cacheKey = `property-${id}`;
    const cached = getFromCache<Property>(cacheKey);
    if (cached) {
      console.log(`[DB] getProperty(${id}) - served from cache`);
      return cached;
    }

    const startTime = Date.now();
    try {
      const [property] = await db.select().from(properties).where(eq(properties.id, id));
      const duration = Date.now() - startTime;
      console.log(`[DB] getProperty(${id}) took ${duration}ms`);
      if (property) {
        setCache(cacheKey, property);
      }
      return property || undefined;
    } catch (error) {
      console.error(`[DB] getProperty(${id}) error:`, error);
      throw error;
    }
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
    
    // 캐시 무효화
    clearCache('all-properties');
    console.log('[DB] Cache cleared after creating property');
    
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    
    // 캐시 무효화
    clearCache('all-properties');
    clearCache(`property-${id}`);
    console.log(`[DB] Cache cleared after updating property ${id}`);
    
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