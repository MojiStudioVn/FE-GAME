import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug"],
      required: true,
      default: "info",
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["frontend", "backend"],
      required: true,
    },
    page: {
      type: String,
    },
    userId: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    stack: {
      type: String,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm nhanh
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ source: 1, timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("Log", logSchema);
