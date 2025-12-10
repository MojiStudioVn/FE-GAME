import express from "express";
import {
  getMissionById,
  verifyMission,
  listPublicMissions,
  startMission,
  getUserMissionStatuses,
} from "../controllers/missionController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public: list available missions
router.get("/", listPublicMissions);

// Authenticated: get today's user mission statuses
router.get("/status", verifyToken, getUserMissionStatuses);

// Public: get mission metadata (by id, alias, shortcut or url segment)
router.get("/:id", getMissionById);

// Authenticated: start mission (reserve ip)
router.post("/:id/start", verifyToken, startMission);

// Authenticated: verify mission and award coins
router.post("/:id/verify", verifyToken, verifyMission);

// Authenticated: get today's user mission statuses
router.get("/status", verifyToken, getUserMissionStatuses);

export default router;
