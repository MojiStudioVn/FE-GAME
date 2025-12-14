import express from "express";
import {
  getPackages,
  buyPackage,
  getShopListings,
} from "../controllers/exchangeController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/exchange/packages
router.get("/packages", getPackages);
// GET /api/exchange/shop-listings (public, no passwords)
router.get("/shop-listings", getShopListings);
// POST /api/exchange/buy - purchase a package (requires auth)
router.post("/buy", verifyToken, buyPackage);

export default router;
