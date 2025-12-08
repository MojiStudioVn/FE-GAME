import mongoose from "mongoose";

const WithdrawConfigSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    api_key: { type: String, required: true },
    withdraw_fee: { type: String, required: true },
    coin_rate: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WithdrawConfig", WithdrawConfigSchema);
