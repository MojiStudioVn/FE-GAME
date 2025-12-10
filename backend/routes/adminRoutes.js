import express from "express";
import { saveWithdrawConfig } from "../controllers/withdrawConfigController.js";
import { createLinkShortcut } from "../controllers/linkShortcutController.js";
import {
  getDashboardStats,
  getTopUsers,
  getRecentLogs,
  getPaymentConfig,
  updatePaymentConfig,
} from "../controllers/adminController.js";
import { withdraw } from "../controllers/withdrawController.js";
import {
  getAllUsers,
  adjustUserCoins,
  searchUser,
  updateUserStatus,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import {
  getMissions,
  createMission,
  updateMission,
  deleteMission,
} from "../controllers/missionController.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard/stats", verifyToken, isAdmin, getDashboardStats);
router.get("/top-users", verifyToken, isAdmin, getTopUsers);
router.get("/recent-logs", verifyToken, isAdmin, getRecentLogs);

// Payment configuration routes
router.get("/payment-config", verifyToken, isAdmin, getPaymentConfig);
router.post("/payment-config", verifyToken, isAdmin, updatePaymentConfig);
router.put("/payment-config", verifyToken, isAdmin, updatePaymentConfig);

// Withdraw API
router.post("/withdraw", verifyToken, isAdmin, withdraw);

// Withdraw config API
router.post("/withdraw-config", verifyToken, isAdmin, saveWithdrawConfig);

// Link shortcut API (cho nhiệm vụ)
router.post("/link-shortcut", verifyToken, isAdmin, createLinkShortcut);

// Missions
router.get("/missions", verifyToken, isAdmin, getMissions);
router.post("/missions", verifyToken, isAdmin, createMission);
router.put("/missions/:id", verifyToken, isAdmin, updateMission);
router.delete("/missions/:id", verifyToken, isAdmin, deleteMission);

// User management routes
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/users/search", verifyToken, isAdmin, searchUser);
router.put("/users/:userId", verifyToken, isAdmin, updateUser);
router.post(
  "/users/:userId/adjust-coins",
  verifyToken,
  isAdmin,
  adjustUserCoins
);
router.post(
  "/users/:userId/reset-password",
  verifyToken,
  isAdmin,
  resetUserPassword
);
router.put("/users/:userId/status", verifyToken, isAdmin, updateUserStatus);
router.delete("/users/:userId", verifyToken, isAdmin, deleteUser);

export default router;
