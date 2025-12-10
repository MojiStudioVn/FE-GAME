import mongoose from "mongoose";

const gameResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: String, default: "tai-xiu" },
    bet: { type: Number, default: 0 },
    winAmount: { type: Number, default: 0 },
    dice: { type: [Number], default: [] },
    outcome: { type: String, enum: ["tai", "xiu"], default: "xiu" },
    deviceInfo: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

const GameResult =
  mongoose.models.GameResult || mongoose.model("GameResult", gameResultSchema);
export default GameResult;
