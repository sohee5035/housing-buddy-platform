import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { warmupDatabase } from "./db";
import { storage } from "./storage";

const app = express();
app.use(express.json({ limit: '50mb' })); // 이미지 업로드를 위한 크기 제한 증가
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`Error ${status}: ${message}`, err);
    
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // 서버 시작 후 데이터베이스 웜업 및 캐시 프리로딩
    try {
      // 1. 데이터베이스 웜업
      await warmupDatabase();
      
      // 2. 캐시 프리로딩 (자주 사용되는 데이터 미리 로드)
      console.log('[STARTUP] Preloading cache...');
      const startTime = Date.now();
      await storage.getProperties(); // 매물 목록 미리 캐시에 저장
      const duration = Date.now() - startTime;
      console.log(`[STARTUP] Cache preloaded in ${duration}ms`);
      
      console.log('[STARTUP] Server initialization complete!');
    } catch (error) {
      console.error('[STARTUP] Initialization failed:', error);
    }
  });
})();
