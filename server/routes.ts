import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all properties
  app.get("/api/properties", async (req, res) => {
    console.log("🚀 /api/properties 요청 받음");
    const startTime = Date.now();
    
    try {
      const properties = await storage.getProperties();
      const endTime = Date.now();
      console.log(`📤 매물 ${properties.length}개 응답 전송 완료, 총 소요시간: ${endTime - startTime}ms`);
      res.json(properties);
    } catch (error) {
      console.error("❌ 매물 조회 API 에러:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
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
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid property data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Update property
  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, validatedData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid property data",
          errors: error.errors 
        });
      }
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

      console.log("Making API request to Google Translate...");
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLang,
            source: 'ko',
          }),
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

  const httpServer = createServer(app);
  return httpServer;
}
