import { properties, comments, users, favorites, type Property, type InsertProperty, type Comment, type InsertComment, type UpdateComment, type DeleteComment, type User, type InsertUser, type LoginUser, type Favorite, type InsertFavorite } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
  updateComment(id: number, updateData: UpdateComment): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>; // Admin only
  deleteCommentWithPassword(id: number, deleteData: DeleteComment): Promise<boolean>; // User with password
  verifyCommentPassword(id: number, password: string): Promise<boolean>;
  getCommentForEdit(id: number, password: string): Promise<Comment | undefined>; // 수정용 댓글 조회
  getAllCommentsForAdmin(): Promise<Comment[]>; // 관리자용 전체 문의 조회
  updateAdminMemo(id: number, memo: string): Promise<Comment | undefined>; // 관리자 메모 업데이트
  
  // User authentication methods
  createUser(userData: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  verifyEmailToken(userId: number, token: string): Promise<boolean>;
  updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined>;
  
  // Favorites methods
  getUserFavorites(userId: number): Promise<Property[]>;
  addToFavorites(userId: number, propertyId: number): Promise<Favorite>;
  removeFromFavorites(userId: number, propertyId: number): Promise<boolean>;
  isFavorite(userId: number, propertyId: number): Promise<boolean>;
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
  async getComments(propertyId: number, isAdmin: boolean = false): Promise<Comment[]> {
    let whereConditions = [
      eq(comments.propertyId, propertyId),
      eq(comments.isDeleted, 0)
    ];
    
    // 관리자가 아니면 관리자 전용 댓글 제외
    if (!isAdmin) {
      whereConditions.push(eq(comments.isAdminOnly, 0));
    }
    
    const result = await db
      .select()
      .from(comments)
      .where(and(...whereConditions))
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

  async updateComment(id: number, updateData: UpdateComment): Promise<Comment | undefined> {
    // 비밀번호가 제공된 경우에만 확인 (로그인 사용자는 비밀번호 불필요)
    if (updateData.password) {
      const isValid = await this.verifyCommentPassword(id, updateData.password);
      if (!isValid) {
        throw new Error("잘못된 비밀번호입니다.");
      }
    }

    const [result] = await db
      .update(comments)
      .set({
        content: updateData.content,
        authorContact: updateData.authorContact,
        isAdminOnly: updateData.isAdminOnly,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
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

  async deleteCommentWithPassword(id: number, deleteData: DeleteComment): Promise<boolean> {
    // 비밀번호가 제공된 경우에만 확인 (로그인 사용자는 비밀번호 불필요)
    if (deleteData.password) {
      const isValid = await this.verifyCommentPassword(id, deleteData.password);
      if (!isValid) {
        throw new Error("잘못된 비밀번호입니다.");
      }
    }

    const [result] = await db
      .update(comments)
      .set({ isDeleted: 1 })
      .where(eq(comments.id, id))
      .returning();
    return !!result;
  }

  async verifyCommentPassword(id: number, password: string): Promise<boolean> {
    const [comment] = await db
      .select({ authorPassword: comments.authorPassword })
      .from(comments)
      .where(eq(comments.id, id));
    
    return comment?.authorPassword === password;
  }

  async getCommentForEdit(id: number, password: string): Promise<Comment | undefined> {
    // 비밀번호 확인
    const isValid = await this.verifyCommentPassword(id, password);
    if (!isValid) {
      throw new Error("잘못된 비밀번호입니다.");
    }

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, id), eq(comments.isDeleted, 0)));
    
    return comment;
  }

  async getAllCommentsForAdmin(): Promise<Comment[]> {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.isDeleted, 0))
      .orderBy(desc(comments.createdAt));
    return result;
  }

  async updateAdminMemo(id: number, memo: string): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set({ 
        adminMemo: memo,
        updatedAt: new Date()
      })
      .where(eq(comments.id, id))
      .returning();
    
    return updatedComment;
  }

  // User authentication methods
  async createUser(userData: InsertUser): Promise<User> {
    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    // 이메일 인증 토큰 생성
    const emailVerificationToken = this.generateEmailVerificationToken();
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        emailVerificationToken,
        isEmailVerified: 0,
      })
      .returning();
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user || undefined;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async verifyEmailToken(userId: number, token: string): Promise<boolean> {
    const [user] = await db
      .select({ emailVerificationToken: users.emailVerificationToken })
      .from(users)
      .where(eq(users.id, userId));
    
    return user?.emailVerificationToken === token;
  }

  async updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isEmailVerified: isVerified ? 1 : 0,
        emailVerificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<Property[]> {
    const result = await db
      .select({
        id: properties.id,
        title: properties.title,
        address: properties.address,
        description: properties.description,
        category: properties.category,
        deposit: properties.deposit,
        monthlyRent: properties.monthlyRent,
        maintenanceFee: properties.maintenanceFee,
        photos: properties.photos,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
        isDeleted: properties.isDeleted,
        otherInfo: properties.otherInfo,
        mapUrl: properties.mapUrl,
        contactInfo: properties.contactInfo,
      })
      .from(properties)
      .innerJoin(favorites, eq(properties.id, favorites.propertyId))
      .where(and(eq(favorites.userId, userId), eq(properties.isDeleted, 0)))
      .orderBy(desc(favorites.createdAt));

    return result;
  }

  async addToFavorites(userId: number, propertyId: number): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({
        userId,
        propertyId,
      })
      .returning();

    return favorite;
  }

  async removeFromFavorites(userId: number, propertyId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));

    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));

    return !!favorite;
  }
}

export const storage = new DatabaseStorage();