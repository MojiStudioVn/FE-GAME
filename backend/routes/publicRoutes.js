import express from "express";
import { getHomeData } from "../controllers/publicController.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import minigameController from "../controllers/minigameController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public home data
router.get("/home", getHomeData);
// Public leaderboard
router.get("/leaderboard", getLeaderboard);
router.post("/minigame/tai-xiu", verifyToken, minigameController.playTaiXiu);
// recent winners (public)
router.get("/minigame/recent-winners", minigameController.getRecentWinners);

export default router;
