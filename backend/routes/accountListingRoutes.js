import express from "express";
import {
  uploadAccount,
  getAccountListings,
  updateAccountListing,
  deleteAccountListing,
  parseBlob,
  runCleanupNow,
  hardDeleteAccount,
  getRecentAccounts,
} from "../controllers/accountListingController.js";
import { uploadAccountImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// POST /api/admin/upload-account (with image upload)
router.post("/upload-account", uploadAccountImages, uploadAccount);

// GET /api/admin/accounts (list all accounts with filters)
router.get("/accounts", getAccountListings);

// GET /api/admin/accounts/recent (get 20 recent accounts)
router.get("/accounts/recent", getRecentAccounts);

// PUT /api/admin/accounts/:id
router.put("/accounts/:id", updateAccountListing);

// DELETE /api/admin/accounts/:id (soft delete)
router.delete("/accounts/:id", deleteAccountListing);

// POST /api/admin/accounts/:id/hard-delete (hard delete with confirmation)
router.post("/accounts/:id/hard-delete", hardDeleteAccount);

// POST /api/admin/parse-blob (for preview)
router.post("/parse-blob", parseBlob);

// POST /api/admin/cleanup-accounts (manual cleanup)
router.post("/cleanup-accounts", runCleanupNow);

// GET /cron/clean-acc (trigger cleanup via HTTP)
router.get("/cron/clean-acc", async (req, res) => {
  try {
    const { runCleanupNow } = await import("../controllers/accountListingController.js");
    // Gọi controller, không cần xác thực admin
    await runCleanupNow(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi chạy cleanup" });
  }
});

export default router;
