import express from "express";
import {
  chargeCard,
  cardCallback,
  getCardHistory,
  getAllCardTransactions,
  getCardAudit,
  buyCard,
} from "../controllers/cardController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/charge", verifyToken, chargeCard);
router.post("/buy", verifyToken, buyCard);
router.get("/history", verifyToken, getCardHistory);

// Callback route (public but verified by signature)
router.post("/callback", cardCallback);
router.get("/callback", cardCallback);

// Admin routes
router.get("/admin/all", verifyToken, isAdmin, getAllCardTransactions);
// Admin audit endpoint: returns full code/serial for authorized admin
router.get("/admin/audit/:requestId", verifyToken, isAdmin, getCardAudit);

export default router;
