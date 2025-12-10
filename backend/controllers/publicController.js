import User from "../models/User.js";
import Log from "../models/Log.js";

// Public home data
export const getHomeData = async (req, res) => {
  try {
    // total users
    const totalUsers = await User.countDocuments();

    // total coins
    const agg = await User.aggregate([
      { $group: { _id: null, totalCoins: { $sum: "$coins" } } },
    ]);
    const totalCoins = agg[0]?.totalCoins || 0;

    // coins distributed in last 24h (from logs)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const coinsLast24h = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo },
          "meta.coins": { $exists: true },
        },
      },
      { $group: { _id: null, totalCoins: { $sum: "$meta.coins" } } },
    ]);
    const coinsDistributed24h = coinsLast24h[0]?.totalCoins || 0;

    // recent public activities (limit 10) - non-sensitive fields only
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("userId", "username")
      .lean();

    const recent = logs.map((log) => ({
      id: log._id,
      user: log.userId?.username || log.userEmail || "System",
      action: log.message,
      coins: log.meta?.coins
        ? `${log.meta.coins > 0 ? "+" : ""}${log.meta.coins} xu`
        : "",
      time: getTimeAgo(log.timestamp),
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCoins,
          coinsDistributed24h,
        },
        recentActivities: recent,
      },
    });
  } catch (err) {
    console.error("Error getting public home data:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Không thể lấy dữ liệu trang chủ",
        error: err.message,
      });
  }
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} giây trước`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}
