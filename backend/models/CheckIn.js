import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0-6 (Sunday-Saturday)
      required: true,
    },
    coins: {
      type: Number,
      required: true,
      default: 0,
    },
    streak: {
      type: Number,
      default: 1,
    },
    weekStart: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
checkInSchema.index({ userId: 1, checkInDate: 1 });
checkInSchema.index({ userId: 1, weekStart: 1 });

export default mongoose.model("CheckIn", checkInSchema);
