import express from "express";
import { createDispute, resolveDispute, getDisputes } from "../controllers/orderDisputeController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User creates dispute
router.post("/create", verifyToken, createDispute);

// Admin resolves dispute
router.post("/:disputeId/resolve", verifyToken, isAdmin, resolveDispute);

// Admin gets all disputes
router.get("/", verifyToken, isAdmin, getDisputes);

export default router;
