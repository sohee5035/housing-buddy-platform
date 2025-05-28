import { properties, type Property, type InsertProperty } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private currentPropertyId: number;

  constructor() {
    this.properties = new Map();
    this.currentPropertyId = 1;
    
    // Initialize with some sample properties
    this.initializeProperties();
  }

  private initializeProperties() {
    const sampleProperties: Property[] = [
      {
        id: 1,
        title: "강남구 신축 원룸",
        address: "서울특별시 강남구 역삼동 123-45",
        deposit: 5000000,
        monthlyRent: 800000,
        description: "지하철역 도보 5분 거리에 위치한 깔끔한 신축 원룸입니다. 풀옵션으로 바로 입주 가능하며, 보안이 우수한 건물입니다.",
        otherInfo: "주차 가능, 엘리베이터 있음, 24시간 보안",
        photos: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"
        ],
        isActive: 1,
        isDeleted: 0,
        deletedAt: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "홍대 투룸 오피스텔",
        address: "서울특별시 마포구 홍익로 67-8",
        deposit: 8000000,
        monthlyRent: 1200000,
        description: "홍대입구역 도보 3분, 복층 구조의 넓은 투룸 오피스텔입니다. 최신 시설과 가전제품이 완비되어 있습니다.",
        otherInfo: "복층, 세탁기, 에어컨, 인터넷 무료",
        photos: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isActive: 1,
        isDeleted: 0,
        deletedAt: null,
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "잠실 고급 아파트",
        address: "서울특별시 송파구 잠실동 456-78",
        deposit: 20000000,
        monthlyRent: 2500000,
        description: "한강뷰를 감상할 수 있는 고급 아파트입니다. 3룸 2욕실로 넓고 쾌적하며, 헬스장과 수영장 등 부대시설이 완비되어 있습니다.",
        otherInfo: "한강뷰, 헬스장, 수영장, 주차 2대 가능",
        photos: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isActive: 1,
        isDeleted: 0,
        deletedAt: null,
        createdAt: new Date(),
      },
      {
        id: 4,
        title: "이태원 루프탑 원룸",
        address: "서울특별시 용산구 이태원동 789-12",
        deposit: 6000000,
        monthlyRent: 900000,
        description: "이태원의 활기찬 분위기를 만끽할 수 있는 루프탑 테라스가 있는 특별한 원룸입니다. 외국인 거주자 환영합니다.",
        otherInfo: "루프탑 테라스, 외국인 환영, 24시간 편의점 근처",
        photos: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isActive: 1,
        isDeleted: 0,
        deletedAt: null,
        createdAt: new Date(),
      },
      {
        id: 5,
        title: "성수동 감성 투룸",
        address: "서울특별시 성동구 성수동 234-56",
        deposit: 7000000,
        monthlyRent: 1100000,
        description: "성수동 카페거리 근처의 감성적인 인테리어로 꾸며진 투룸입니다. 높은 천장과 넓은 창으로 개방감이 뛰어납니다.",
        otherInfo: "높은 천장, 카페거리 근처, 감성 인테리어",
        photos: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        isActive: 1,
        isDeleted: 0,
        deletedAt: null,
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

  async getProperties(): Promise<Property[]> {
    const filteredProperties = Array.from(this.properties.values()).filter(
      (property) => property.isActive === 1 && (!property.isDeleted || property.isDeleted === 0)
    );

    // Sort by creation date (newest first)
    return filteredProperties.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
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
      otherInfo: insertProperty.otherInfo || null,
      photos: insertProperty.photos || [],
      isActive: 1,
      isDeleted: 0,
      deletedAt: null,
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
    console.log("Deleting property:", id, property);
    
    if (!property || property.isActive === 0) {
      console.log("Property not found or already inactive");
      return false;
    }

    // Soft delete - move to trash
    const updatedProperty: Property = {
      ...property,
      isActive: 0,
      isDeleted: 1,
      deletedAt: new Date(),
    };
    
    console.log("Updated property:", updatedProperty);
    this.properties.set(id, updatedProperty);
    console.log("Property stored in map");
    return true;
  }

  async getDeletedProperties(): Promise<Property[]> {
    console.log("=== TRASH ENDPOINT: getDeletedProperties called ===");
    console.log("Total properties in map:", this.properties.size);
    
    const allProperties = Array.from(this.properties.values());
    console.log("All properties:", allProperties.map(p => ({ 
      id: p.id, 
      title: p.title, 
      isDeleted: p.isDeleted, 
      isActive: p.isActive,
      deletedAt: p.deletedAt 
    })));
    
    const deletedProperties = allProperties.filter(
      (property) => property.isDeleted === 1
    );
    
    console.log("Filtered deleted properties:", deletedProperties.length);
    console.log("Deleted properties:", deletedProperties);
    
    // Sort by deletion date (newest first)
    return deletedProperties.sort((a, b) => {
      const dateA = a.deletedAt instanceof Date ? a.deletedAt : new Date(a.deletedAt!);
      const dateB = b.deletedAt instanceof Date ? b.deletedAt : new Date(b.deletedAt!);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async restoreProperty(id: number): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property || property.isDeleted !== 1) return undefined;
    
    const restoredProperty: Property = {
      ...property,
      isActive: 1,
      isDeleted: 0,
      deletedAt: null,
    };
    
    this.properties.set(id, restoredProperty);
    return restoredProperty;
  }

  async permanentDeleteProperty(id: number): Promise<boolean> {
    console.log("=== PERMANENT DELETE CALLED ===");
    console.log("Attempting to permanently delete property ID:", id);
    
    const property = this.properties.get(id);
    console.log("Found property:", property ? "Yes" : "No");
    
    if (!property) {
      console.log("Property not found");
      return false;
    }
    
    if (property.isDeleted !== 1) {
      console.log("Property is not deleted (isDeleted:", property.isDeleted, ")");
      return false;
    }
    
    console.log("Deleting property from memory...");
    const result = this.properties.delete(id);
    console.log("Delete result:", result);
    console.log("Properties remaining:", this.properties.size);
    
    return result;
  }
}

export const storage = new MemStorage();
