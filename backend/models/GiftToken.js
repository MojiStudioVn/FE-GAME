import mongoose from "mongoose";

const giftTokenSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    coins: {
      type: Number,
      required: true,
      min: 1,
    },
    maxUses: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
giftTokenSchema.index({ code: 1 });
giftTokenSchema.index({ isEnabled: 1 });
giftTokenSchema.index({ expiresAt: 1 });

// Virtual to check if token is still valid
giftTokenSchema.virtual("isValid").get(function () {
  return (
    this.isEnabled &&
    this.usedCount < this.maxUses &&
    new Date() < this.expiresAt
  );
});

const GiftToken = mongoose.model("GiftToken", giftTokenSchema);

export default GiftToken;
