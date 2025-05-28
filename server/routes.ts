import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all properties with optional filters
  app.get("/api/properties", async (req, res) => {
    try {
      const {
        city,
        propertyType,
        minPrice,
        maxPrice,
        listingType,
        limit = "50",
        offset = "0",
        search
      } = req.query;

      let properties;

      if (search) {
        properties = await storage.searchProperties(search as string);
      } else {
        const filters = {
          city: city as string,
          propertyType: propertyType as string,
          minPrice: minPrice ? parseInt(minPrice as string) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
          listingType: listingType as string,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        };

        properties = await storage.getProperties(filters);
      }

      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
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
      const success = await storage.deleteProperty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLang } = req.body;

      if (!text || !targetLang) {
        return res.status(400).json({ message: "Text and target language are required" });
      }

      // Mock translations for demo purposes
      const translations: Record<string, Record<string, string>> = {
        ko: {
          "Modern 3-bedroom apartment with stunning city views, premium finishes, and world-class amenities.": "멋진 도시 전망, 프리미엄 마감재, 세계적 수준의 편의시설을 갖춘 현대적인 3베드룸 아파트입니다.",
          "Spacious family home with large backyard, modern kitchen, and quiet neighborhood setting.": "넓은 뒷마당, 현대적인 주방, 조용한 동네 환경을 갖춘 넓은 가족 주택입니다.",
          "Exclusive penthouse with panoramic ocean views, private rooftop terrace, and luxury amenities.": "파노라마 바다 전망, 전용 옥상 테라스, 고급 편의시설을 갖춘 독점적인 펜트하우스입니다."
        },
        ja: {
          "Modern 3-bedroom apartment with stunning city views, premium finishes, and world-class amenities.": "素晴らしい街の景色、プレミアム仕上げ、世界クラスのアメニティを備えたモダンな3ベッドルームアパートメント。",
          "Spacious family home with large backyard, modern kitchen, and quiet neighborhood setting.": "広い裏庭、モダンなキッチン、静かな住宅街にある広々とした家族向け住宅。",
          "Exclusive penthouse with panoramic ocean views, private rooftop terrace, and luxury amenities.": "パノラマオーシャンビュー、プライベートルーフトップテラス、高級アメニティを備えた専用ペントハウス。"
        },
        zh: {
          "Modern 3-bedroom apartment with stunning city views, premium finishes, and world-class amenities.": "现代化的3居室公寓，享有迷人的城市景观，高档装修和世界一流的设施。",
          "Spacious family home with large backyard, modern kitchen, and quiet neighborhood setting.": "宽敞的家庭住宅，拥有大后院、现代化厨房和安静的社区环境。",
          "Exclusive penthouse with panoramic ocean views, private rooftop terrace, and luxury amenities.": "独特的顶层公寓，享有全景海景、私人屋顶露台和豪华设施。"
        },
        es: {
          "Modern 3-bedroom apartment with stunning city views, premium finishes, and world-class amenities.": "Apartamento moderno de 3 dormitorios con impresionantes vistas de la ciudad, acabados premium y comodidades de clase mundial.",
          "Spacious family home with large backyard, modern kitchen, and quiet neighborhood setting.": "Casa familiar espaciosa con gran patio trasero, cocina moderna y entorno de vecindario tranquilo.",
          "Exclusive penthouse with panoramic ocean views, private rooftop terrace, and luxury amenities.": "Ático exclusivo con vistas panorámicas al océano, terraza privada en la azotea y comodidades de lujo."
        },
        fr: {
          "Modern 3-bedroom apartment with stunning city views, premium finishes, and world-class amenities.": "Appartement moderne de 3 chambres avec vue imprenable sur la ville, finitions haut de gamme et commodités de classe mondiale.",
          "Spacious family home with large backyard, modern kitchen, and quiet neighborhood setting.": "Maison familiale spacieuse avec grand jardin arrière, cuisine moderne et cadre de quartier tranquille.",
          "Exclusive penthouse with panoramic ocean views, private rooftop terrace, and luxury amenities.": "Penthouse exclusif avec vue panoramique sur l'océan, terrasse privée sur le toit et commodités de luxe."
        }
      };

      const translatedText = translations[targetLang]?.[text] || `Translation to ${targetLang} not available for this text.`;

      res.json({ translatedText });
    } catch (error) {
      res.status(500).json({ message: "Translation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
