import User from "../models/User.js";
import Log from "../models/Log.js";
import { createUserLog } from "../utils/logService.js";
import UserMission from "../models/UserMission.js";
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

    // Xu được phát trong 24h (từ logs) and previous 24h for change calculation
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDayAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const coinsLast24hAgg = await Log.aggregate([
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
    const coinsDistributed24h = coinsLast24hAgg[0]?.totalCoins || 0;

    // previous 24h window (24-48h ago)
    const coinsPrev24hAgg = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: twoDayAgo, $lt: oneDayAgo },
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
    const coinsPrev24h = coinsPrev24hAgg[0]?.totalCoins || 0;

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
        change: coinsDistributed24h - coinsPrev24h,
        changePercent:
          coinsPrev24h > 0
            ? (
                ((coinsDistributed24h - coinsPrev24h) / coinsPrev24h) *
                100
              ).toFixed(1)
            : coinsDistributed24h > 0
            ? "100.0"
            : "0.0",
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

    // Thêm thông tin rank và missions (thực tế)
    const usersWithRank = await Promise.all(
      topUsers.map(async (user, index) => {
        const missionsCount = await UserMission.countDocuments({
          user: user._id,
        });
        return {
          ...user,
          rank: index + 1,
          missions: missionsCount,
          lastActive: getTimeAgo(user.updatedAt),
          badge: getBadge(user.coins),
        };
      })
    );

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
    const type = req.query.type || "recharge-card";

    let config = await PaymentConfig.findOne({ type }).lean();

    if (!config) {
      // Create default config for this type
      const defaultDiscount = 70;
      config = await PaymentConfig.create({
        type,
        provider: "TheNapVip.Com",
        partnerId: "",
        partnerKey: "",
        walletNumber: "",
        cardDiscount: {
          VIETTEL: defaultDiscount,
          MOBIFONE: defaultDiscount,
          VINAPHONE: defaultDiscount,
          ZING: defaultDiscount,
          GATE: defaultDiscount,
          GARENA: defaultDiscount,
        },
        updatedBy: req.user.id,
      });
    }
    // Ensure cardDiscount contains all known providers before returning
    const providers = [
      "VIETTEL",
      "MOBIFONE",
      "VINAPHONE",
      "ZING",
      "GATE",
      "GARENA",
    ];
    if (!config.cardDiscount || typeof config.cardDiscount !== "object")
      config.cardDiscount = {};
    const existingValues = Object.values(config.cardDiscount).filter(
      (v) => typeof v === "number"
    );
    const fallback = existingValues.length ? existingValues[0] : 70;
    for (const p of providers) {
      if (typeof config.cardDiscount[p] === "undefined")
        config.cardDiscount[p] = fallback;
    }
    res.status(200).json({ success: true, data: config });
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
    const { partnerId, partnerKey, cardDiscount, walletNumber, type } =
      req.body;
    const cfgType = type || req.query.type || "recharge-card";

    // Try to find existing config by type
    let config = await PaymentConfig.findOne({ type: cfgType });

    if (!config) {
      // Normalize cardDiscount: allow number or object
      let cardDiscountPayload = cardDiscount;
      if (
        typeof cardDiscount === "number" ||
        typeof cardDiscount === "string"
      ) {
        const v = Number(cardDiscount) || 0;
        cardDiscountPayload = {
          VIETTEL: v,
          MOBIFONE: v,
          VINAPHONE: v,
          ZING: v,
          GATE: v,
          GARENA: v,
        };
      }

      // create new config for this type
      config = await PaymentConfig.create({
        type: cfgType,
        provider: "TheNapVip.Com",
        partnerId,
        partnerKey,
        walletNumber,
        cardDiscount: cardDiscountPayload,
        updatedBy: req.user.id,
      });
    } else {
      config.partnerId = partnerId;
      config.partnerKey = partnerKey;
      config.walletNumber = walletNumber || config.walletNumber;

      // If cardDiscount is a number/string, preserve existing keys and set them to this value
      if (
        typeof cardDiscount === "number" ||
        typeof cardDiscount === "string"
      ) {
        const v = Number(cardDiscount) || 0;
        if (config.cardDiscount && typeof config.cardDiscount === "object") {
          for (const k of Object.keys(config.cardDiscount)) {
            config.cardDiscount[k] = v;
          }
        } else {
          config.cardDiscount = {
            VIETTEL: v,
            MOBIFONE: v,
            VINAPHONE: v,
            ZING: v,
            GATE: v,
            GARENA: v,
          };
        }
      } else if (cardDiscount && typeof cardDiscount === "object") {
        // If an object is provided, merge keys (overwrite existing ones)
        config.cardDiscount = {
          ...(config.cardDiscount || {}),
          ...cardDiscount,
        };
      }
      // Ensure all known provider keys exist on cardDiscount
      const providers = [
        "VIETTEL",
        "MOBIFONE",
        "VINAPHONE",
        "ZING",
        "GATE",
        "GARENA",
      ];
      if (!config.cardDiscount || typeof config.cardDiscount !== "object") {
        config.cardDiscount = {};
      }
      // choose fallback value from one of existing keys or 0
      const existingValues = Object.values(config.cardDiscount).filter(
        (v) => typeof v === "number"
      );
      const fallback = existingValues.length ? existingValues[0] : 0;
      for (const p of providers) {
        if (typeof config.cardDiscount[p] === "undefined")
          config.cardDiscount[p] = fallback;
      }

      config.updatedBy = req.user.id;
      await config.save();
    }

    // Create log
    await createUserLog(req, {
      action: "update_payment_config",
      source: "backend",
      message: "Cập nhật cấu hình thanh toán",
      page: "/admin/settings/payment",
      meta: {
        type: "payment_config",
        cfgType,
        partnerId,
        walletNumber,
        cardDiscount,
        // record actor role so UIs can filter admin actions from regular user feeds
        actorRole: req.user.role || "",
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
