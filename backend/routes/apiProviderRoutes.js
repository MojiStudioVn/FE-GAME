import express from "express";
import {
  getProviders,
  addProvider,
  updateProvider,
  deleteProvider,
} from "../controllers/apiProviderController.js";

const router = express.Router();

// GET /api/admin/api-providers
router.get("/api-providers", getProviders);

// GET /api/admin/api-providers/:provider
router.get("/api-providers/:provider", async (req, res) => {
  try {
    const provider = req.params.provider;
    const doc = await (
      await import("../models/APIProvider.js")
    ).default.findOne({ provider, status: "active" });
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhà cung cấp" });
    res.json({
      apiKey: doc.apiKey,
      provider: doc.provider,
      apiUrl: doc.apiUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/api-providers
router.post("/api-providers", addProvider);

// PUT /api/admin/api-providers/:id
router.put("/api-providers/:id", updateProvider);

// DELETE /api/admin/api-providers/:id
router.delete("/api-providers/:id", deleteProvider);

export default router;
