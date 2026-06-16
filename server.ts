/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import wasteRequestRoutes from "./src/routes/waste-requests.js";
import vendorRoutes from "./src/routes/vendors.js";
import transactionRoutes from "./src/routes/transactions.js";
import notificationRoutes from "./src/routes/notifications.js";
import rewardRoutes from "./src/routes/rewards.js";
import aiClassificationRoutes from "./src/routes/ai-classification.js";
import bankAccountRoutes from "./src/routes/bank-accounts.js";

// Import middleware
import { authMiddleware, optionalAuth } from "./src/middleware/auth.js";
import { errorHandler, notFoundHandler } from "./src/middleware/error-handler.js";
import { requestLogger } from "./src/middleware/logger.js";

// Import database
import { getDatabase, closeDatabase } from "./src/utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
getDatabase();

// ===== MIDDLEWARE =====
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(requestLogger);

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ===== API ROUTES =====

// Auth routes
app.use("/api/auth", authRoutes);

// User routes (with optional auth)
app.use("/api/users", userRoutes);

// Waste request routes (with optional auth)
app.use("/api/waste-requests", wasteRequestRoutes);

// Vendor routes
app.use("/api/vendors", vendorRoutes);

// Transaction routes
app.use("/api/transactions", transactionRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Reward routes
app.use("/api/rewards", rewardRoutes);

// AI Classification routes
app.use("/api/ai-classification", aiClassificationRoutes);

// Bank accounts routes
app.use("/api", bankAccountRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "EcoTrade API",
    version: "1.0.0",
    description: "Backend API for waste recycling and environmental trading platform",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      wasteRequests: "/api/waste-requests",
      vendors: "/api/vendors",
      transactions: "/api/transactions",
      notifications: "/api/notifications",
      rewards: "/api/rewards",
      aiClassification: "/api/ai-classification",
    },
    documentation: "/api/docs",
  });
});

// ===== VITE DEV SERVER =====
let viteServer: any = null;

async function setupVite() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("dist"));
  } else {
    viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteServer.middlewares);
  }

  // SPA fallback
  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;
      
      if (process.env.NODE_ENV === "production") {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      } else {
        const template = await viteServer.transformIndexHtml(url, `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>EcoTrade</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      }
    } catch (e) {
      res.status(500).end("Internal Server Error");
    }
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  closeDatabase();
  if (viteServer) {
    viteServer.close();
  }
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, async () => {
  await setupVite();
  console.log(`
╔════════════════════════════════════════╗
║         EcoTrade Server Started        ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}        │
║  API:    http://localhost:${PORT}/api      │
║  Health: http://localhost:${PORT}/api/health │
╚════════════════════════════════════════╝
  `);
});

export default app;
