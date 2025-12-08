import mongoose from "mongoose";

const giftTokenUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    giftToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiftToken",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    coinsReceived: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
giftTokenUsageSchema.index({ user: 1 });
giftTokenUsageSchema.index({ giftToken: 1 });
giftTokenUsageSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate usage
giftTokenUsageSchema.index({ user: 1, giftToken: 1 }, { unique: true });

const GiftTokenUsage = mongoose.model("GiftTokenUsage", giftTokenUsageSchema);

export default GiftTokenUsage;
