import express from "express";
import { getPurchaseById } from "../controllers/purchaseController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/purchases/:id - require auth (buyer or admin)
router.get("/:id", verifyToken, getPurchaseById);

export default router;
