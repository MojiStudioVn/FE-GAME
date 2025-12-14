import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: { type: String },
    price: { type: Number, default: 0 },
    accountSnapshot: { type: Object }, // store username, password, ssCards, sssCards, skins, level, rank, etc.
    ipAddress: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", PurchaseSchema);

export default Purchase;
