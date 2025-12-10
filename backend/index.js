import express from "express";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import { config } from "./config/env.js";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import checkInRoutes from "./routes/checkInRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import { cardCallback } from "./controllers/cardController.js";
import giftTokenRoutes from "./routes/giftTokenRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import accountListingRoutes from "./routes/accountListingRoutes.js";
import apiProviderRoutes from "./routes/apiProviderRoutes.js";
import linkShortenerRoutes from "./routes/linkShortenerRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

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
app.use("/api/public", publicRoutes);
app.use("/api/admin/order-disputes", orderDisputeRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start listening
  app.listen(config.PORT, () => {
    console.log(`🚀 Server được khởi động ở PORT ${config.PORT}`);
    console.log(`📡 Đường dẫn API: http://localhost:${config.PORT}/api`);
  });
};

startServer().catch((error) => {
  console.error("❌ Lỗi khởi động server:", error);
  process.exit(1);
});

export default app;
