import mongoose from "mongoose";

const userMissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
    },
    claimedAt: { type: Date, default: Date.now },
    rewardGiven: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["started", "completed"],
      default: "completed",
    },
    ip: { type: String, default: "" },
    deviceInfo: { type: String, default: "" },
  },
  { timestamps: true }
);

const UserMission =
  mongoose.models.UserMission ||
  mongoose.model("UserMission", userMissionSchema);

export default UserMission;
