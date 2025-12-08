import express from "express";
import {
  createGiftToken,
  getAllGiftTokens,
  toggleGiftToken,
  deleteGiftToken,
  getTokenUsageHistory,
  exportGiftTokens,
} from "../controllers/giftTokenController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

// Gift token CRUD
router.post("/gift-tokens", createGiftToken);
router.get("/gift-tokens", getAllGiftTokens);
router.patch("/gift-tokens/:id/toggle", toggleGiftToken);
router.delete("/gift-tokens/:id", deleteGiftToken);

// Token usage history
router.get("/gift-tokens/:id/usage", getTokenUsageHistory);

// Export
router.get("/gift-tokens/export/csv", exportGiftTokens);

export default router;
