import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import { config } from "./config/env.js";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import checkInRoutes from "./routes/checkInRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { extractToken } from "./middleware/auth.js";
import cardRoutes from "./routes/cardRoutes.js";
import { cardCallback } from "./controllers/cardController.js";
import giftTokenRoutes from "./routes/giftTokenRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import accountListingRoutes from "./routes/accountListingRoutes.js";
import apiProviderRoutes from "./routes/apiProviderRoutes.js";
import linkShortenerRoutes from "./routes/linkShortenerRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import ChatMessage from "./models/ChatMessage.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import {
  httpsRedirect,
  securityHeaders,
  ipTracking,
  rateLimit,
  userSessionConfig,
} from "./middleware/security.js";
import orderDisputeRoutes from "./routes/orderDisputeRoutes.js";

// Create Express app
const app = express();

// When behind a reverse proxy (Apache/nginx) trust the first proxy so
// req.ip and req.secure reflect the original request. This prevents
// incorrect HTTP->HTTPS redirects when SSL is terminated at Apache.
app.set("trust proxy", 1);

// Request logging for debugging unexpected HTML responses
app.use((req, res, next) => {
  try {
    console.log(
      `[req] ${req.method} ${req.originalUrl || req.url} host=${
        req.headers.host
      } accept=${req.headers.accept}`
    );
  } catch (e) {
    // ignore logging errors
  }
  next();
});

// Security Middleware (apply first)
app.use(httpsRedirect); // Redirect HTTP to HTTPS in production
app.use(helmet()); // Basic security headers
app.use(securityHeaders); // Custom CSP and security headers
app.use(ipTracking); // Track client IPs

// Rate limiting
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  })
);

// Session configuration
app.use(session(userSessionConfig));

// Handle Private Network Access preflight requests (ngrok -> localhost)
// Browsers may send `Access-Control-Request-Private-Network: true` on preflight
// and expect the server to respond with `Access-Control-Allow-Private-Network: true`.
app.use((req, res, next) => {
  try {
    const acrpn = req.headers["access-control-request-private-network"];
    if (req.method === "OPTIONS" && acrpn === "true") {
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
  } catch (e) {
    // ignore
  }
  next();
});

// Development helper: ensure CORS headers are present for any origin (ngrok, local tunnels)
// This middleware echoes the request Origin back and handles OPTIONS preflights.
if (config.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    try {
      const origin = req.headers.origin || "*";
      // Echo origin when available so credentials can be supported in dev.
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Request-Private-Network"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");

      if (req.method === "OPTIONS") {
        // Quick response for preflight
        return res.sendStatus(204);
      }
    } catch (e) {
      // ignore
    }
    next();
  });
}

// CORS: in development allow dynamic origins (so ngrok/public URLs can reach local API).
const corsOptions =
  config.NODE_ENV === "production"
    ? { origin: config.CLIENT_URL, credentials: true }
    : {
        origin: true,
        credentials: true,
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "Accept",
          "Access-Control-Request-Method",
          "Access-Control-Request-Headers",
          "Access-Control-Request-Private-Network",
        ],
      };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/checkin", checkInRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/card", cardRoutes);

// Debug logging for admin UI page requests (safe: does not log token values)
app.use("/admin", (req, res, next) => {
  try {
    const { diagnostic } = extractToken(req);
    if (config.NODE_ENV !== "production") {
      console.info("[admin-page] Request:", {
        method: req.method,
        url: req.originalUrl || req.url,
        hasAuthHeader: diagnostic.hasAuthHeader,
        cookieNames: diagnostic.cookieNames,
        hasSessionToken: diagnostic.hasSessionToken,
        ip: req.ip || req.connection?.remoteAddress,
      });
    }
  } catch (e) {
    // ignore
  }
  next();
});

// Public aliases for provider callbacks
// Some providers expect callback to be at `/card/callback` (root) and may call via GET or POST.
app.post("/card/callback", cardCallback);
app.get("/card/callback", cardCallback);
app.use("/api/admin", giftTokenRoutes);
app.use("/api/admin", settingsRoutes);
app.use("/api/admin", accountListingRoutes);

app.use("/api/admin", apiProviderRoutes);
app.use("/api", linkShortenerRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/admin/order-disputes", orderDisputeRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

// Start server with Socket.IO
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server and attach socket.io
  const server = http.createServer(app);

  const io = new IOServer(server, {
    cors: {
      origin: config.CLIENT_URL || true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    socket.on("join", ({ channel } = {}) => {
      const ch = channel || "general";
      socket.join(ch);
      console.log(`Socket ${socket.id} joined ${ch}`);
    });

    socket.on("message", async (data) => {
      try {
        // data: { channel, user, text, meta }
        if (!data || !data.channel || !data.text) return;
        const doc = await ChatMessage.create({
          channel: data.channel,
          user: data.user || "guest",
          text: data.text,
          meta: data.meta || {},
        });
        // Broadcast to room
        io.to(data.channel).emit("message", doc);
      } catch (err) {
        console.error("Error saving/broadcasting message", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected", socket.id, reason);
    });
  });

  // Mount chat REST routes (public)
  app.use("/api/public/chat", chatRoutes);

  // Start listening
  server.listen(config.PORT, () => {
    console.log(`🚀 Server được khởi động ở PORT ${config.PORT}`);
    console.log(`📡 Đường dẫn API: http://localhost:${config.PORT}/api`);
  });
};

startServer().catch((error) => {
  console.error("❌ Lỗi khởi động server:", error);
  process.exit(1);
});

export default app;
