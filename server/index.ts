import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, markServerReady } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for external domains
app.set('trust proxy', true);

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
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`Error ${status}: ${message}`, err.stack || err);
    
    if (!res.headersSent) {
      res.status(status).json({ 
        message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
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
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";
    
    server.listen(port, host, () => {
      log(`serving on ${host}:${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Server ready for connections`);
      
      // Add a small delay to ensure all initialization is complete
      // before marking server as ready for health checks
      setTimeout(() => {
        markServerReady();
        log(`Health checks now accepting requests`);
      }, 1000); // 1 second delay
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use`);
        process.exit(1);
      } else {
        log(`Server error: ${error.message}`);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });

  } catch (error) {
    log(`Failed to start server: ${error}`);
    console.error(error);
    process.exit(1);
  }
})();
