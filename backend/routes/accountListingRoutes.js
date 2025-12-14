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
  uploadAccountsFile,
  getUploadJobStatus,
} from "../controllers/accountListingController.js";
import {
  uploadAccountImages,
  uploadAccountFile,
} from "../middleware/uploadMiddleware.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/admin/upload-account (with image upload) - admin only
router.post(
  "/upload-account",
  verifyToken,
  isAdmin,
  uploadAccountImages,
  uploadAccount
);

// POST /api/admin/upload-accounts (file upload: txt/docx) - for bulk account upload
// Protect route with admin auth
router.post(
  "/upload-accounts",
  verifyToken,
  isAdmin,
  uploadAccountFile,
  uploadAccountsFile
);

// GET job status
router.get("/upload-jobs/:id", verifyToken, isAdmin, getUploadJobStatus);

// GET /api/admin/accounts (list all accounts with filters) - admin only
router.get("/accounts", verifyToken, isAdmin, getAccountListings);

// GET /api/admin/accounts/recent (get 20 recent accounts)
router.get("/accounts/recent", getRecentAccounts);

// PUT /api/admin/accounts/:id - admin only
router.put("/accounts/:id", verifyToken, isAdmin, updateAccountListing);

// DELETE /api/admin/accounts/:id (soft delete) - admin only
router.delete("/accounts/:id", verifyToken, isAdmin, deleteAccountListing);

// POST /api/admin/accounts/:id/hard-delete (hard delete with confirmation) - admin only
router.post(
  "/accounts/:id/hard-delete",
  verifyToken,
  isAdmin,
  hardDeleteAccount
);

// POST /api/admin/parse-blob (for preview) - admin only
router.post("/parse-blob", verifyToken, isAdmin, parseBlob);

// POST /api/admin/cleanup-accounts (manual cleanup) - admin only
router.post("/cleanup-accounts", verifyToken, isAdmin, runCleanupNow);

// GET /cron/clean-acc (trigger cleanup via HTTP)
router.get("/cron/clean-acc", async (req, res) => {
  try {
    const { runCleanupNow } = await import(
      "../controllers/accountListingController.js"
    );
    // Gọi controller, không cần xác thực admin
    await runCleanupNow(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi chạy cleanup" });
  }
});

export default router;
