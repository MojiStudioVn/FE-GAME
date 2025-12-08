import express from "express";
import {
  shortenLink,
  getProviderStats,
  getLinkStats,
  testProvider,
  getLinkHistory,
  getLinkDetails,
  updateLinkStatus,
  deleteLink,
  getStatsOverview,
} from "../controllers/linkShortenerController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/shorten - Shorten a URL
router.post("/shorten", verifyToken, shortenLink);

// GET /api/provider-stats/:provider - Get stats for a provider
router.get("/provider-stats/:provider", verifyToken, getProviderStats);

// GET /api/link-stats/:provider/:slug - Get stats for a specific link
router.get("/link-stats/:provider/:slug", verifyToken, getLinkStats);

// POST /api/test-provider - Test provider connection
router.post("/test-provider", verifyToken, testProvider);

// GET /api/links/history - Get link history with pagination
router.get("/links/history", verifyToken, getLinkHistory);

// GET /api/links/stats - Get statistics overview
router.get("/links/stats", verifyToken, getStatsOverview);

// GET /api/links/:id - Get single link details
router.get("/links/:id", verifyToken, getLinkDetails);

// PUT /api/links/:id - Update link status
router.put("/links/:id", verifyToken, updateLinkStatus);

// DELETE /api/links/:id - Delete link
router.delete("/links/:id", verifyToken, deleteLink);

export default router;
