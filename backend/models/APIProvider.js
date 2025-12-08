import mongoose from "mongoose";

const apiProviderSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: [
        "linktop",
        "link4m",
        "yeulink",
        "yeumoney",
        "site2s",
        "funlink",
        "linkngon",
        "linkngon-net",
        "linkngon-io",
        "4mmo",
        "bbmkts",
        "uptolink",
      ],
      unique: true,
    },
    apiKey: {
      type: String,
      required: true,
    },
    apiUrl: {
      type: String,
      default: "",
    },
    partnerId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const APIProvider =
  mongoose.models.APIProvider ||
  mongoose.model("APIProvider", apiProviderSchema);

export default APIProvider;
