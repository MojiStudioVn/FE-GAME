import express from "express";
import {
  getSettings,
  updateSettings,
  getHealthStats,
  runCleanupNow,
} from "../controllers/settingsController.js";

const router = express.Router();

// GET /api/admin/settings
router.get("/settings", getSettings);

// POST /api/admin/settings
router.post("/settings", updateSettings);

// GET /api/admin/health-stats
router.get("/health-stats", getHealthStats);

// POST /api/admin/cleanup-now
router.post("/cleanup-now", runCleanupNow);

export default router;
