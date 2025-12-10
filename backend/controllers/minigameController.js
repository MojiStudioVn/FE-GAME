import User from "../models/User.js";
import GameResult from "../models/GameResult.js";
import { resolveClientIpFromReq } from "../utils/ipUtils.js";

// POST /api/minigame/tai-xiu
export const playTaiXiu = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập" });

    const { choice, bet } = req.body || {};
    const betAmt = Number(bet) || 0;
    if (!choice || !["tai", "xiu"].includes(choice))
      return res
        .status(400)
        .json({ success: false, message: "Choice không hợp lệ" });
    if (betAmt <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Số xu cược phải lớn hơn 0" });

    // Atomic deduction: only deduct if user has enough coins
    const user = await User.findOneAndUpdate(
      { _id: userId, coins: { $gte: betAmt } },
      { $inc: { coins: -betAmt } },
      { new: true }
    );
    if (!user)
      return res.status(400).json({ success: false, message: "Không đủ xu" });

    // roll 3 dice
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const dice = [d1, d2, d3];
    const sum = d1 + d2 + d3;
    const outcome = sum >= 11 ? "tai" : "xiu";

    // Determine win: for simplicity payout = bet * 2 (net profit = bet)
    let winAmount = 0;
    if (choice === outcome) {
      winAmount = betAmt * 2;
      // credit winning amount
      const after = await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: winAmount } },
        { new: true }
      );
      // updated coins returned
      user.coins = after.coins;
    }

    // record game result
    const ip = resolveClientIpFromReq(req);
    await GameResult.create({
      user: userId,
      game: "tai-xiu",
      bet: betAmt,
      winAmount,
      dice,
      outcome,
      deviceInfo: req.headers["user-agent"] || "",
      ip,
    });

    return res.status(200).json({
      success: true,
      result: { dice, outcome, winAmount },
      coins: user.coins,
    });
  } catch (err) {
    console.error("Error in playTaiXiu:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi chơi" });
  }
};

// GET /api/public/minigame/recent-winners
export const getRecentWinners = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const rows = await GameResult.find({
      game: "tai-xiu",
      winAmount: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "username avatar")
      .lean();

    const winners = rows.map((r) => ({
      id: r._id,
      username: r.user?.username || "Ẩn danh",
      avatar: r.user?.avatar || null,
      prize: r.winAmount || 0,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({ success: true, winners });
  } catch (err) {
    console.error("Error fetching recent winners:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy người thắng gần đây" });
  }
};

export default { playTaiXiu, getRecentWinners };
