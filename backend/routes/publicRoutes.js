import express from "express";
import { getHomeData } from "../controllers/publicController.js";
import { getAccountsBySkin } from "../controllers/accountListingController.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import minigameController from "../controllers/minigameController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public home data
router.get("/home", getHomeData);
// Public leaderboard
router.get("/leaderboard", getLeaderboard);
// Public find by skin
router.get("/find-account", getAccountsBySkin);
router.post("/minigame/tai-xiu", verifyToken, minigameController.playTaiXiu);
// recent winners (public)
router.get("/minigame/recent-winners", minigameController.getRecentWinners);

export default router;
