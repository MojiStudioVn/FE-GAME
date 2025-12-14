import mongoose from "mongoose";

const uploadJobSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    filename: { type: String },
    status: {
      type: String,
      enum: ["queued", "processing", "done", "failed"],
      default: "queued",
    },
    progress: { type: Number, default: 0 },
    message: { type: String },
    result: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const UploadJob = mongoose.model("UploadJob", uploadJobSchema);

export default UploadJob;
