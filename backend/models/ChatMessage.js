import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    channel: { type: String, required: true, index: true },
    user: { type: String, required: true },
    text: { type: String, required: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
export default ChatMessage;
