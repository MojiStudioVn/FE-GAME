import User from "../models/User.js";
import Log from "../models/Log.js";
import PaymentConfig from "../models/PaymentConfig.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Tổng số users
    const totalUsers = await User.countDocuments();

    // Tổng xu trong hệ thống
    const usersWithCoins = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCoins: { $sum: "$coins" },
        },
      },
    ]);
    const totalCoins = usersWithCoins[0]?.totalCoins || 0;

    // Xu được phát trong 24h (từ logs)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const coinsLast24h = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo },
          "meta.coins": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          totalCoins: { $sum: "$meta.coins" },
        },
      },
    ]);
    const coinsDistributed24h = coinsLast24h[0]?.totalCoins || 0;

    // Users mới trong 24h
    const newUsersLast24h = await User.countDocuments({
      createdAt: { $gte: oneDayAgo },
    });

    // Tính thay đổi so với ngày hôm trước (mock data cho demo)
    const stats = {
      totalUsers: {
        value: totalUsers,
        change: newUsersLast24h,
        changePercent:
          totalUsers > 0
            ? ((newUsersLast24h / totalUsers) * 100).toFixed(1)
            : 0,
      },
      totalCoins: {
        value: totalCoins,
        change: coinsDistributed24h,
        changePercent:
          totalCoins > 0
            ? ((coinsDistributed24h / totalCoins) * 100).toFixed(1)
            : 0,
      },
      coinsDistributed24h: {
        value: coinsDistributed24h,
        change: Math.floor(coinsDistributed24h * 0.15), // Mock 15% tăng
        changePercent: "15.0",
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
      error: error.message,
    });
  }
};

// @desc    Get top users by coins
// @route   GET /api/admin/top-users
// @access  Private/Admin
export const getTopUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await User.find()
      .select("username email coins createdAt updatedAt")
      .sort({ coins: -1 })
      .limit(Number(limit))
      .lean();

    // Thêm thông tin rank và missions (mock cho demo)
    const usersWithRank = topUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      missions: Math.floor(Math.random() * 100) + 50, // Mock missions
      lastActive: getTimeAgo(user.updatedAt),
      badge: getBadge(user.coins),
    }));

    res.status(200).json({
      success: true,
      data: usersWithRank,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy top users:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách top users",
      error: error.message,
    });
  }
};

// @desc    Get recent activity logs
// @route   GET /api/admin/recent-logs
// @access  Private/Admin
export const getRecentLogs = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .populate("userId", "username email")
      .lean();

    // Format logs cho frontend
    const formattedLogs = logs.map((log) => {
      const coins = log.meta?.coins || 0;
      const type = determineLogType(log.message, log.meta);

      return {
        id: log._id,
        type,
        user: log.userId?.username || log.userEmail || "System",
        action: log.message,
        amount: coins !== 0 ? `${coins > 0 ? "+" : ""}${coins} xu` : "",
        time: getTimeAgo(log.timestamp),
        status:
          log.level === "error" ? "failed" : log.meta?.status || "success",
        timestamp: log.timestamp,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedLogs,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy recent logs:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy logs hoạt động",
      error: error.message,
    });
  }
};

// Helper functions
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return `${seconds} giây trước`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

function getBadge(coins) {
  if (coins >= 100000) return "VIP";
  if (coins >= 50000) return "Premium";
  return null;
}

function determineLogType(message, meta) {
  const messageLower = message?.toLowerCase() || "";

  if (messageLower.includes("nhiệm vụ") || messageLower.includes("mission"))
    return "mission";
  if (
    messageLower.includes("điểm danh") ||
    messageLower.includes("check") ||
    messageLower.includes("checkin")
  )
    return "checkin";
  if (messageLower.includes("đổi acc") || messageLower.includes("exchange"))
    return "exchange";
  if (
    messageLower.includes("mời") ||
    messageLower.includes("referral") ||
    messageLower.includes("hoa hồng")
  )
    return "referral";
  if (
    messageLower.includes("mua xu") ||
    messageLower.includes("nạp") ||
    messageLower.includes("purchase")
  )
    return "purchase";
  if (
    messageLower.includes("mini game") ||
    messageLower.includes("game") ||
    messageLower.includes("vòng quay")
  )
    return "game";
  if (
    messageLower.includes("admin") ||
    messageLower.includes("system") ||
    messageLower.includes("sự kiện")
  )
    return "admin";

  return "activity";
}

// @desc    Get payment configuration
// @route   GET /api/admin/payment-config
// @access  Private/Admin
export const getPaymentConfig = async (req, res) => {
  try {
    let config = await PaymentConfig.findOne().lean();

    if (!config) {
      // Create default config if not exists
      config = await PaymentConfig.create({
        provider: "TheNapVip.Com",
        partnerId: "",
        partnerKey: "",
        cardDiscount: {
          VIETTEL: 70,
          MOBIFONE: 70,
          VINAPHONE: 70,
        },
        updatedBy: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("❌ Error getting payment config:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy cấu hình thanh toán",
      error: error.message,
    });
  }
};

// @desc    Update payment configuration
// @route   POST /api/admin/payment-config
// @access  Private/Admin
export const updatePaymentConfig = async (req, res) => {
  try {
    const { partnerId, partnerKey, cardDiscount } = req.body;

    let config = await PaymentConfig.findOne();

    if (!config) {
      config = await PaymentConfig.create({
        provider: "TheNapVip.Com",
        partnerId,
        partnerKey,
        cardDiscount,
        updatedBy: req.user.id,
      });
    } else {
      config.partnerId = partnerId;
      config.partnerKey = partnerKey;
      config.cardDiscount = cardDiscount;
      config.updatedBy = req.user.id;
      await config.save();
    }

    // Create log
    await Log.create({
      action: "update_payment_config",
      source: "backend",
      message: "Cập nhật cấu hình thanh toán",
      userId: req.user.id,
      userName: req.user.username,
      userEmail: req.user.email,
      meta: {
        type: "payment_config",
        partnerId,
        cardDiscount,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật cấu hình thành công",
      data: config,
    });
  } catch (error) {
    console.error("❌ Error updating payment config:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật cấu hình",
      error: error.message,
    });
  }
};
