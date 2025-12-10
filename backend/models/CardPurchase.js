import mongoose from "mongoose";

const cardPurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    transId: {
      type: String,
      default: null,
    },
    serviceCode: {
      type: String,
      required: true,
    },
    walletNumber: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: Number,
      default: 99, // Pending
    },
    message: {
      type: String,
      default: "PENDING",
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const CardPurchase = mongoose.model("CardPurchase", cardPurchaseSchema);

export default CardPurchase;
