import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    siteBrand: {
      type: String,
      default: "Game Platform",
      trim: true,
    },
    cspMode: {
      type: String,
      enum: ["report-only", "enforce", "strict", "moderate", "relaxed"],
      default: "moderate",
      description: "Content Security Policy mode",
    },
    cardHistoryRetentionDays: {
      type: Number,
      min: 1,
      max: 365,
      default: 90,
    },
    cleanupCount: {
      type: Number,
      default: 0,
    },
    lastCleanup: {
      type: Date,
      default: null,
    },

    // Security Settings (non-sensitive)
    rateLimitWindowMs: {
      type: Number,
      default: 900000, // 15 minutes
      min: 60000, // 1 minute
      max: 3600000, // 1 hour
      description: "Rate limit time window in milliseconds",
    },
    rateLimitMax: {
      type: Number,
      default: 100,
      min: 10,
      max: 10000,
      description: "Maximum requests per window",
    },

    // HTTPS Settings
    httpsEnabled: {
      type: Boolean,
      default: false,
      description: "Force HTTPS redirect in production",
    },

    // Session Settings (non-sensitive)
    sessionMaxAge: {
      type: Number,
      default: 604800000, // 7 days for users
      description: "User session max age in milliseconds",
    },
    adminSessionMaxAge: {
      type: Number,
      default: 86400000, // 24 hours for admins
      description: "Admin session max age in milliseconds",
    },

    // File Upload Settings
    maxFileSize: {
      type: Number,
      default: 10485760, // 10MB
      description: "Maximum file size in bytes",
    },
    maxFiles: {
      type: Number,
      default: 10,
      description: "Maximum number of files per upload",
    },
    allowedFileTypes: {
      type: [String],
      default: ["image/jpeg", "image/png", "image/webp"],
      description: "Allowed MIME types for uploads",
    },
  },
  {
    timestamps: true,
  }
);

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
