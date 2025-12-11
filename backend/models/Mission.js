import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    provider: { type: String, default: "" },
    url: { type: String, required: true },
    shortcut: { type: String, default: "" },
    alias: { type: String, default: "" },
    code: { type: String, default: "" }, // mã xác nhận hoặc OTP
    reward: { type: Number, default: 0 },
    uses: { type: Number, default: 0 },
    singleUsePerUser: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["draft", "active", "disabled"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const Mission =
  mongoose.models.Mission || mongoose.model("Mission", missionSchema);
export default Mission;
