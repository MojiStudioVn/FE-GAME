import mongoose from "mongoose";

const paymentConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["buy-card", "recharge-card", "withdraw"],
      default: "recharge-card",
    },
    provider: {
      type: String,
      default: "TheNapVip.Com",
    },
    partnerId: {
      type: String,
      required: false,
      default: "",
    },
    partnerKey: {
      type: String,
      required: false,
      default: "",
    },
    walletNumber: {
      type: String,
      required: false,
      default: "",
    },
    cardDiscount: {
      VIETTEL: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
      MOBIFONE: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
      VINAPHONE: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const PaymentConfig = mongoose.model("PaymentConfig", paymentConfigSchema);

export default PaymentConfig;
