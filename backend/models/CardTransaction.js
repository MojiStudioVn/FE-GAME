import mongoose from "mongoose";

const cardTransactionSchema = new mongoose.Schema(
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
      type: Number,
      default: null,
    },
    telco: {
      type: String,
      required: true,
      enum: ["VIETTEL", "MOBIFONE", "VINAPHONE"],
    },
    code: {
      type: String,
      required: true,
    },
    serial: {
      type: String,
      required: true,
    },
    declaredValue: {
      type: Number,
      required: true,
    },
    cardValue: {
      type: Number,
      default: null,
    },
    value: {
      type: Number,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 99, // 1: Success, 2: Wrong value, 3: Error, 4: Maintenance, 99: Pending, 100: Failed
    },
    message: {
      type: String,
      default: "PENDING",
    },
    callbackSign: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const CardTransaction = mongoose.model(
  "CardTransaction",
  cardTransactionSchema
);

export default CardTransaction;
