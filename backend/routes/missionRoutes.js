import express from "express";
import { getMissionById, verifyMission } from "../controllers/missionController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public: get mission metadata
router.get("/:id", getMissionById);

// Authenticated: verify mission and award coins
router.post("/:id/verify", verifyToken, verifyMission);

export default router;
