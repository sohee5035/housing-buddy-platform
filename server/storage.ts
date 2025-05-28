import { properties, type Property, type InsertProperty } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property methods
  getProperties(filters?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    listingType?: string;
    limit?: number;
    offset?: number;
  }): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  searchProperties(query: string): Promise<Property[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private currentUserId: number;
  private currentPropertyId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    
    // Initialize with some sample properties
    this.initializeProperties();
  }

  private initializeProperties() {
    const sampleProperties: Property[] = [
      {
        id: 1,
        title: "Luxury Downtown Apartment",
        description: "Modern 3-bedroom apartment with stunning city views, premium finishes, and world-class amenities. Floor-to-ceiling windows provide breathtaking city views, while premium finishes throughout create an atmosphere of sophisticated elegance.",
        propertyType: "apartment",
        city: "New York",
        address: "Manhattan, New York",
        price: 850000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1200,
        photos: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"
        ],
        listingType: "sale",
        isActive: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Family Suburban Home",
        description: "Spacious family home with large backyard, modern kitchen, and quiet neighborhood setting. Perfect for families looking for comfort and space.",
        propertyType: "house",
        city: "Westchester",
        address: "Westchester, NY",
        price: 4200,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2100,
        photos: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        listingType: "rent",
        isActive: 1,
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Ocean View Penthouse",
        description: "Exclusive penthouse with panoramic ocean views, private rooftop terrace, and luxury amenities. The ultimate in luxury living.",
        propertyType: "condo",
        city: "Miami Beach",
        address: "Miami Beach, FL",
        price: 2200000,
        bedrooms: 2,
        bathrooms: 3,
        squareFeet: 1800,
        photos: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        listingType: "sale",
        isActive: 1,
        createdAt: new Date(),
      },
      {
        id: 4,
        title: "Industrial Loft",
        description: "Trendy loft apartment with exposed brick walls, high ceilings, and modern industrial design. Perfect for urban professionals.",
        propertyType: "apartment",
        city: "Brooklyn",
        address: "Brooklyn, NY",
        price: 3200,
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 900,
        photos: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        listingType: "rent",
        isActive: 1,
        createdAt: new Date(),
      },
      {
        id: 5,
        title: "Victorian Charmer",
        description: "Historic Victorian home with original features, modern updates, and beautiful garden. A perfect blend of classic and contemporary.",
        propertyType: "house",
        city: "San Francisco",
        address: "San Francisco, CA",
        price: 1450000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1600,
        photos: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        listingType: "sale",
        isActive: 1,
        createdAt: new Date(),
      },
      {
        id: 6,
        title: "Glass Tower Studio",
        description: "Modern studio apartment in glass tower with city views and premium amenities. Perfect for young professionals.",
        propertyType: "apartment",
        city: "Chicago",
        address: "Chicago, IL",
        price: 2800,
        bedrooms: 0,
        bathrooms: 1,
        squareFeet: 650,
        photos: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        listingType: "rent",
        isActive: 1,
        createdAt: new Date(),
      }
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.id, property);
      if (property.id >= this.currentPropertyId) {
        this.currentPropertyId = property.id + 1;
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProperties(filters?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    listingType?: string;
    limit?: number;
    offset?: number;
  }): Promise<Property[]> {
    let filteredProperties = Array.from(this.properties.values()).filter(
      (property) => property.isActive === 1
    );

    if (filters) {
      if (filters.city) {
        filteredProperties = filteredProperties.filter(
          (property) => property.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters.propertyType) {
        filteredProperties = filteredProperties.filter(
          (property) => property.propertyType === filters.propertyType
        );
      }
      if (filters.minPrice !== undefined) {
        filteredProperties = filteredProperties.filter(
          (property) => property.price >= filters.minPrice!
        );
      }
      if (filters.maxPrice !== undefined) {
        filteredProperties = filteredProperties.filter(
          (property) => property.price <= filters.maxPrice!
        );
      }
      if (filters.listingType) {
        filteredProperties = filteredProperties.filter(
          (property) => property.listingType === filters.listingType
        );
      }
    }

    // Sort by creation date (newest first)
    filteredProperties.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return filteredProperties.slice(offset, offset + limit);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const property = this.properties.get(id);
    return property?.isActive === 1 ? property : undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const existingProperty = this.properties.get(id);
    if (!existingProperty || existingProperty.isActive === 0) {
      return undefined;
    }

    const updatedProperty: Property = {
      ...existingProperty,
      ...updateData,
    };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const property = this.properties.get(id);
    if (!property || property.isActive === 0) {
      return false;
    }

    // Soft delete
    property.isActive = 0;
    this.properties.set(id, property);
    return true;
  }

  async searchProperties(query: string): Promise<Property[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.properties.values()).filter(
      (property) =>
        property.isActive === 1 &&
        (property.title.toLowerCase().includes(searchTerm) ||
         property.description.toLowerCase().includes(searchTerm) ||
         property.city.toLowerCase().includes(searchTerm) ||
         property.address.toLowerCase().includes(searchTerm))
    );
  }
}

export const storage = new MemStorage();
