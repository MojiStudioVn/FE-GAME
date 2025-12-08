import express from "express";
import {
  createLog,
  getLogs,
  deleteLogs,
  getLogStats,
} from "../controllers/logController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/logs - Tạo log mới (public - frontend có thể gửi)
router.post("/", createLog);

// GET /api/logs - Lấy danh sách logs (admin only)
router.get("/", verifyToken, isAdmin, getLogs);

// GET /api/logs/stats - Lấy thống kê logs (admin only)
router.get("/stats", verifyToken, isAdmin, getLogStats);

// DELETE /api/logs - Xóa logs cũ (admin only)
router.delete("/", verifyToken, isAdmin, deleteLogs);

export default router;
