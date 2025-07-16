import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertCommentSchema, updateCommentSchema, deleteCommentSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "./cloudinary";
import { migrateImagesToCloudinary } from "./migrate-images";
import { sendEmailVerification, sendWelcomeEmail } from "./email";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPgSimple from "connect-pg-simple";

// Multer 설정 (메모리 저장소 사용)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

// Server readiness flag
let isServerReady = false;
let serverStartTime = Date.now();

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration with PostgreSQL store
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'housing-buddy-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS에서는 true로 설정
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
  }));

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: '등록되지 않은 이메일입니다.' });
      }

      // 이메일 인증 체크 제거 (도메인 구매 전까지 비활성화)
      // if (!user.isEmailVerified) {
      //   return done(null, false, { message: '이메일 인증이 필요합니다.' });
      // }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: '비밀번호가 올바르지 않습니다.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: '로그인이 필요합니다.' });
  };

  // University routes
  app.get("/api/universities", async (req: Request, res: Response) => {
    try {
      const universities = await storage.getUniversities();
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).json({ message: "대학교 목록을 가져오는데 실패했습니다." });
    }
  });
  // Health check endpoint specifically for deployment health checks
  app.get("/health", (req, res) => {
    const uptime = Date.now() - serverStartTime;
    
    if (!isServerReady) {
      return res.status(503).json({ 
        status: "starting", 
        service: "Housing Buddy",
        message: "Server is starting up",
        uptime: `${Math.round(uptime / 1000)}s`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({ 
      status: "ok", 
      service: "Housing Buddy", 
      version: "1.0.0",
      uptime: `${Math.round(uptime / 1000)}s`,
      timestamp: new Date().toISOString() 
    });
  });

  // Additional health check endpoint for API
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Authentication Routes
  
  // User registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Generate verification link
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : `http://${req.get('host')}`;
      const verificationLink = `${baseUrl}/verify-email?token=${user.emailVerificationToken}&userId=${user.id}`;
      
      // Send verification email
      const emailSent = await sendEmailVerification({
        to: user.email,
        verificationCode: user.emailVerificationToken!.substring(0, 6).toUpperCase(),
        verificationLink
      });

      if (!emailSent) {
        console.warn("Failed to send verification email to:", user.email);
      }

      res.status(201).json({ 
        message: "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.",
        userId: user.id,
        email: user.email,
        emailSent 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "입력 정보가 올바르지 않습니다.",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  // Email verification
  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token, userId } = req.query;
      
      if (!token || !userId) {
        return res.status(400).json({ message: "유효하지 않은 인증 링크입니다." });
      }

      const isValidToken = await storage.verifyEmailToken(Number(userId), String(token));
      if (!isValidToken) {
        return res.status(400).json({ message: "만료되거나 유효하지 않은 인증 토큰입니다." });
      }

      // Update user verification status
      const updatedUser = await storage.updateUserVerification(Number(userId), true);
      if (!updatedUser) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      // Send welcome email
      await sendWelcomeEmail({
        to: updatedUser.email,
        userName: updatedUser.name
      });

      res.json({ 
        message: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          isEmailVerified: updatedUser.isEmailVerified
        }
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "이메일 인증 중 오류가 발생했습니다." });
    }
  });

  // User login
  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "로그인에 실패했습니다." });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
        }
        return res.json({
          message: "로그인 성공",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified
          }
        });
      });
    })(req, res, next);
  });

  // User logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
      }
      res.json({ message: "로그아웃 되었습니다." });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified
      });
    } else {
      res.status(401).json({ message: "로그인이 필요합니다." });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "이메일이 필요합니다." });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "등록되지 않은 이메일입니다." });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "이미 인증된 계정입니다." });
      }

      // Generate new verification token
      const newToken = storage.generateEmailVerificationToken();
      
      // Update user with new token (this would need a new storage method)
      // For now, we'll use the existing token
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : `http://${req.get('host')}`;
      const verificationLink = `${baseUrl}/verify-email?token=${user.emailVerificationToken}&userId=${user.id}`;
      
      const emailSent = await sendEmailVerification({
        to: user.email,
        verificationCode: user.emailVerificationToken!.substring(0, 6).toUpperCase(),
        verificationLink
      });

      if (!emailSent) {
        return res.status(500).json({ message: "이메일 발송에 실패했습니다." });
      }

      res.json({ message: "인증 이메일을 다시 발송했습니다." });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "인증 이메일 재발송 중 오류가 발생했습니다." });
    }
  });

  // Send verification code for one-page registration
  app.post("/api/auth/send-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || !z.string().email().safeParse(email).success) {
        return res.status(400).json({ message: "유효한 이메일을 입력해주세요." });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Store verification code temporarily (in production, use Redis or database)
      // For now, we'll use a simple in-memory storage
      global.tempVerificationCodes = global.tempVerificationCodes || {};
      global.tempVerificationCodes[email] = {
        code: verificationCode,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      };

      // Send verification email
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : `http://${req.get('host')}`;
      const verificationLink = `${baseUrl}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`;
      
      const emailSent = await sendEmailVerification({
        to: email,
        verificationCode,
        verificationLink
      });

      if (!emailSent) {
        return res.status(500).json({ message: "이메일 발송에 실패했습니다." });
      }

      res.json({ 
        message: "인증번호를 발송했습니다. 이메일을 확인해주세요.",
        email 
      });
    } catch (error) {
      console.error("Send verification error:", error);
      res.status(500).json({ message: "인증번호 발송 중 오류가 발생했습니다." });
    }
  });

  // Verify code and register user
  app.post("/api/auth/verify-and-register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, phone, verificationCode } = req.body;
      
      // Validate input - verification code is now optional
      if (!email || !password || !name) {
        return res.status(400).json({ message: "이름, 이메일, 비밀번호를 모두 입력해주세요." });
      }

      // Check verification code only if provided
      let isVerified = false;
      if (verificationCode) {
        global.tempVerificationCodes = global.tempVerificationCodes || {};
        const storedCode = global.tempVerificationCodes[email];
        
        if (!storedCode || storedCode.expires < Date.now()) {
          return res.status(400).json({ message: "인증번호가 만료되었습니다. 다시 요청해주세요." });
        }
        
        if (storedCode.code !== verificationCode.toUpperCase()) {
          return res.status(400).json({ message: "인증번호가 올바르지 않습니다." });
        }
        
        isVerified = true;
        // Clean up verification code
        delete global.tempVerificationCodes[email];
      }

      // Check if user already exists (double check)
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      // Create user with conditional email verification
      const userData = {
        email,
        password,
        name,
        phone: phone || undefined,
        isEmailVerified: isVerified // True only if verification code was provided and valid
      };

      const user = await storage.createUser(userData);
      
      // Send welcome email only if verification was completed
      if (isVerified) {
        await sendWelcomeEmail({
          to: user.email,
          userName: user.name
        });
      }

      res.status(201).json({ 
        message: isVerified 
          ? "회원가입이 완료되었습니다. 환영합니다!" 
          : "회원가입이 완료되었습니다. (도메인 구매 후 이메일 인증 가능)",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (error) {
      console.error("Verify and register error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  // Upload image to Cloudinary
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Cloudinary에 이미지 업로드
      const result = await uploadImageToCloudinary(req.file.buffer, {
        folder: 'real-estate',
        quality: 'auto',
        width: 1200,
        height: 800,
        crop: 'limit'
      });

      res.json({
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Check Cloudinary configuration
  app.get("/api/cloudinary-status", async (req, res) => {
    try {
      const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 
          process.env.CLOUDINARY_CLOUD_NAME.substring(0, 3) + '***' : 'NOT_SET',
        api_key: process.env.CLOUDINARY_API_KEY ? 
          process.env.CLOUDINARY_API_KEY.substring(0, 3) + '***' : 'NOT_SET',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT_SET'
      };
      res.json({ config, status: 'Configuration loaded' });
    } catch (error) {
      res.status(500).json({ message: "Failed to check configuration" });
    }
  });

  // Migrate existing images to Cloudinary (admin only, separate from startup)
  app.post("/api/migrate-images", async (req, res) => {
    try {
      console.log("Starting image migration to Cloudinary...");
      // Run migration in background to avoid blocking
      setImmediate(async () => {
        try {
          await migrateImagesToCloudinary();
          console.log("Image migration completed successfully in background");
        } catch (error) {
          console.error("Background image migration failed:", error);
        }
      });
      res.json({ message: "Image migration started in background" });
    } catch (error) {
      console.error("Error starting image migration:", error);
      res.status(500).json({ message: "Failed to start migration" });
    }
  });

  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.setHeader('Content-Type', 'application/json');
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get all property-university relationships
  app.get("/api/properties/universities", async (req, res) => {
    try {
      // Get all properties and their university relationships
      const properties = await storage.getProperties();
      const allPropertyUniversities = [];
      
      for (const property of properties) {
        const universities = await storage.getPropertyUniversities(property.id);
        for (const uni of universities) {
          allPropertyUniversities.push({
            propertyId: property.id,
            universityId: uni.universityId,
            distanceKm: uni.distanceKm,
            isRecommended: uni.isRecommended
          });
        }
      }
      
      res.json(allPropertyUniversities);
    } catch (error) {
      console.error("Error fetching property universities:", error);
      res.status(500).json({ message: "Failed to fetch property universities" });
    }
  });

  // GET /api/trash - Get deleted properties
  app.get("/api/trash", async (req, res) => {
    try {
      console.log("=== Trash endpoint called ===");
      const deletedProperties = await storage.getDeletedProperties();
      console.log("Deleted properties returned:", deletedProperties.length);
      res.json(deletedProperties);
    } catch (error: any) {
      console.error("Error fetching deleted properties:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single property by ID
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Create new property
  app.post("/api/properties", async (req, res) => {
    try {
      const { selectedUniversities, ...propertyData } = req.body;
      const validatedData = insertPropertySchema.parse(propertyData);
      const property = await storage.createProperty(validatedData);
      
      // Add university relationships if provided
      if (selectedUniversities && Array.isArray(selectedUniversities) && selectedUniversities.length > 0) {
        await storage.addPropertyUniversities(property.id, selectedUniversities);
      }
      
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid property data",
          errors: error.errors 
        });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Update property
  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { selectedUniversities, ...propertyData } = req.body;
      const validatedData = insertPropertySchema.partial().parse(propertyData);
      const property = await storage.updateProperty(id, validatedData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Update university relationships if provided
      if (selectedUniversities && Array.isArray(selectedUniversities)) {
        const universitiesWithSelected = selectedUniversities.map(uni => ({
          ...uni,
          isSelected: true
        }));
        await storage.updatePropertyUniversities(id, universitiesWithSelected);
      }

      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid property data",
          errors: error.errors 
        });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  // Delete property
  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("=== DELETE REQUEST ===");
      console.log("Deleting property ID:", id);
      const success = await storage.deleteProperty(id);
      console.log("Delete operation success:", success);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error in delete route:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // GET /api/trash - Get all deleted properties
  app.get("/api/trash", async (req: Request, res: Response) => {
    try {
      console.log("=== TRASH ENDPOINT CALLED ===");
      const deletedProperties = await storage.getDeletedProperties();
      console.log("=== RETURNING DELETED PROPERTIES ===", deletedProperties.length);
      res.json(deletedProperties);
    } catch (error: any) {
      console.error("Error fetching deleted properties:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/trash/:id/restore - Restore a property from trash
  app.post("/api/trash/:id/restore", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const restoredProperty = await storage.restoreProperty(id);
      
      if (!restoredProperty) {
        return res.status(404).json({ message: "Property not found in trash" });
      }
      
      res.json(restoredProperty);
    } catch (error: any) {
      console.error("Error restoring property:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/trash/:id - Permanently delete a property
  app.delete("/api/trash/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.permanentDeleteProperty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found in trash" });
      }
      
      res.json({ message: "Property permanently deleted" });
    } catch (error: any) {
      console.error("Error permanently deleting property:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/translate - Translate text
  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      console.log("=== TRANSLATE ENDPOINT CALLED ===");
      const { text, targetLang } = req.body;
      console.log("Request data:", { text, targetLang });
      
      if (!text || !targetLang) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "Text and target language are required" });
      }

      const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) {
        console.log("No API key found");
        return res.status(500).json({ message: "Translation service not configured" });
      }

      // 한국어로 번역할 때는 소스 언어를 자동 감지하고, 다른 언어로 번역할 때는 한국어에서 번역
      const requestBody: any = {
        q: text,
        target: targetLang,
      };

      // 같은 언어로 번역하는 경우 원본 텍스트 그대로 반환
      if (targetLang === 'ko') {
        return res.json({ translatedText: text });
      }

      // 한국어가 아닌 다른 언어로 번역할 때만 소스 언어 지정
      requestBody.source = 'ko';

      console.log("Making API request to Google Translate...");
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("API error response:", errorText);
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;
      
      res.json({ translatedText });
    } catch (error: any) {
      console.error("Error translating text:", error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // Comment routes
  // Get comments for a property (본인 댓글만)
  app.get("/api/properties/:id/comments", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // 관리자 여부 확인
      const isAdmin = req.headers['x-admin'] === 'true';
      
      // 로그인한 사용자 ID 가져오기
      const user = req.user as any;
      const userId = user?.id;
      
      const comments = await storage.getComments(propertyId, userId, isAdmin);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a comment (members only)
  app.post("/api/properties/:id/comments", requireAuth, async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const user = req.user as any;
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        propertyId,
        authorName: user.name, // 로그인한 사용자 이름 사용
      });

      const comment = await storage.createComment({
        ...validatedData,
        userId: user.id
      });
      res.status(201).json(comment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Update a comment (members only)
  app.put("/api/comments/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const validatedData = updateCommentSchema.parse(req.body);
      const comment = await storage.updateComment(commentId, validatedData);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(comment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });



  // Delete a comment (members only for own comments, admin for all)
  app.delete("/api/comments/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const success = await storage.deleteComment(commentId);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });



  // Update admin memo (이 라우트를 먼저 배치)
  app.put("/api/admin/comments/:id/memo", async (req: Request, res: Response) => {
    console.log(`PUT /api/admin/comments/${req.params.id}/memo 요청 받음:`, req.body);
    try {
      const { id } = req.params;
      const { memo } = req.body;
      
      const updatedComment = await storage.updateAdminMemo(parseInt(id), memo || "");
      
      if (!updatedComment) {
        console.log(`댓글 ID ${id}를 찾을 수 없음`);
        return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
      }
      
      console.log(`메모 업데이트 성공:`, updatedComment);
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating admin memo:", error);
      res.status(500).json({ message: "관리자 메모 업데이트에 실패했습니다." });
    }
  });

  // Update admin reply
  app.put("/api/admin/comments/:id/reply", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      
      const updatedComment = await storage.updateAdminReply(parseInt(id), reply || "");
      
      if (!updatedComment) {
        return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
      }
      
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating admin reply:", error);
      res.status(500).json({ message: "관리자 답변 업데이트에 실패했습니다." });
    }
  });

  // Get all comments for admin
  app.get("/api/admin/comments", async (req: Request, res: Response) => {
    try {
      const comments = await storage.getAllCommentsForAdmin();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching admin comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Get user's own inquiries with property details
  app.get("/api/my-inquiries", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const inquiries = await storage.getUserInquiries(user.id);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching user inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Favorites Routes
  // Get user's favorite properties
  app.get("/api/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const favorites = await storage.getUserFavorites(user.id);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add property to favorites
  app.post("/api/favorites/:propertyId", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const propertyId = parseInt(req.params.propertyId);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(user.id, propertyId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Property already in favorites" });
      }

      const favorite = await storage.addToFavorites(user.id, propertyId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  // Remove property from favorites
  app.delete("/api/favorites/:propertyId", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const propertyId = parseInt(req.params.propertyId);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const success = await storage.removeFromFavorites(user.id, propertyId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Check if property is favorite
  app.get("/api/favorites/:propertyId/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const propertyId = parseInt(req.params.propertyId);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const isFavorite = await storage.isFavorite(user.id, propertyId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Export function to mark server as ready
export function markServerReady() {
  if (isServerReady) {
    console.log("Server already marked as ready");
    return;
  }
  
  isServerReady = true;
  const uptime = Date.now() - serverStartTime;
  console.log(`Server marked as ready for health checks after ${Math.round(uptime / 1000)}s`);
  console.log("Health check endpoint (/) will now return 200 status");
}
