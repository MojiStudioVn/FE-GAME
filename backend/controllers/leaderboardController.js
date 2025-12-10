import UserMission from "../models/UserMission.js";
import User from "../models/User.js";

// GET /api/public/leaderboard?period=week&limit=20
export const getLeaderboard = async (req, res) => {
  try {
    const period = req.query.period || "week"; // week | month | all
    const limit = Math.min(parseInt(req.query.limit) || 20, 200);

    let startDate = null;
    const now = new Date();
    if (period === "week") {
      // start from Monday of current week (VN: Monday)
      const day = now.getDay();
      const diff = (day + 6) % 7; // days since Monday
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const match = { status: "completed" };
    if (startDate) match.createdAt = { $gte: startDate };

    // Aggregate user missions by user
    const agg = [
      { $match: match },
      {
        $group: {
          _id: "$user",
          totalCoins: { $sum: "$rewardGiven" },
          missions: { $sum: 1 },
          lastClaim: { $max: "$claimedAt" },
        },
      },
      { $sort: { totalCoins: -1, missions: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          username: "$user.username",
          avatar: "$user.avatar",
          totalCoins: 1,
          missions: 1,
          lastClaim: 1,
        },
      },
    ];

    const rows = await UserMission.aggregate(agg).exec();

    res.status(200).json({ success: true, leaderboard: rows });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy bảng xếp hạng" });
  }
};

export default { getLeaderboard };
