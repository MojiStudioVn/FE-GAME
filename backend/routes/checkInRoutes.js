import express from "express";
import { getCheckInStatus, checkIn } from "../controllers/checkInController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes
router.get("/", getCheckInStatus);
router.post("/", checkIn);

export default router;
