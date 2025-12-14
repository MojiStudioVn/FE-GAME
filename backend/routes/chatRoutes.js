import express from "express";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

// GET /api/public/chat/:channel?limit=50
router.get("/:channel", async (req, res) => {
  try {
    const channel = req.params.channel || "general";
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

    const msgs = await ChatMessage.find({ channel })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // return in chronological order
    res.json({ success: true, messages: msgs.reverse(), total: msgs.length });
  } catch (err) {
    console.error("Error fetching chat messages", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy tin nhắn" });
  }
});

export default router;
