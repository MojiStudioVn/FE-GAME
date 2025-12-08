import express from "express";
import {
  chargeCard,
  cardCallback,
  getCardHistory,
  getAllCardTransactions,
} from "../controllers/cardController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/charge", verifyToken, chargeCard);
router.get("/history", verifyToken, getCardHistory);

// Callback route (public but verified by signature)
router.post("/callback", cardCallback);

// Admin routes
router.get("/admin/all", verifyToken, isAdmin, getAllCardTransactions);

export default router;
