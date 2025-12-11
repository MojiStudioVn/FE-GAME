import mongoose from "mongoose";
import CheckIn from "../models/CheckIn.js";
import User from "../models/User.js";
import Mission from "../models/Mission.js";
import UserMission from "../models/UserMission.js";

// Helper: Get week start date (Monday)
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Helper: Get today start
const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// @desc    Get check-in status
// @route   GET /api/checkin
// @access  Private
export const getCheckInStatus = async (req, res, next) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        message: "Database chưa kết nối. Vui lòng thử lại sau.",
      });
    }

    const userId = req.user.id;
    const today = getTodayStart();
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get this week's check-ins
    const weekCheckIns = await CheckIn.find({
      userId,
      weekStart,
      checkInDate: { $gte: weekStart, $lt: weekEnd },
    }).sort({ checkInDate: 1 });

    // Check if already checked in today
    const todayCheckIn = weekCheckIns.find(
      (ci) => ci.checkInDate.getTime() === today.getTime()
    );

    // Calculate current streak
    const allCheckIns = await CheckIn.find({ userId })
      .sort({ checkInDate: -1 })
      .limit(30);

    let currentStreak = 0;
    if (allCheckIns.length > 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if there's a check-in today or yesterday
      const latestCheckIn = allCheckIns[0].checkInDate;
      if (
        latestCheckIn.getTime() === today.getTime() ||
        latestCheckIn.getTime() === yesterday.getTime()
      ) {
        currentStreak = allCheckIns[0].streak;
      }
    }

    // Get user's total coins
    const user = await User.findById(userId);

    // Check if user completed any mission today (required to be eligible for check-in)
    const todayStart = getTodayStart();
    const hasCompletedMissionToday = await UserMission.exists({
      user: userId,
      status: "completed",
      createdAt: { $gte: todayStart },
    });

    res.status(200).json({
      success: true,
      data: {
        canCheckIn: !todayCheckIn && !!hasCompletedMissionToday,
        todayCheckIn: todayCheckIn || null,
        weekCheckIns: weekCheckIns.map((ci) => ({
          date: ci.checkInDate,
          dayOfWeek: ci.dayOfWeek,
          coins: ci.coins,
        })),
        currentStreak,
        totalCoins: user?.coins || 0,
        weekStart,
        weekEnd,
        hasCompletedMissionToday: !!hasCompletedMissionToday,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in
// @route   POST /api/checkin
// @access  Private
export const checkIn = async (req, res, next) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        message: "Database chưa kết nối. Vui lòng thử lại sau.",
      });
    }

    const userId = req.user.id;
    const today = getTodayStart();
    const dayOfWeek = today.getDay();
    const weekStart = getWeekStart(today);

    // Check if already checked in today
    const existingCheckIn = await CheckIn.findOne({
      userId,
      checkInDate: today,
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã điểm danh hôm nay rồi",
      });
    }

    // Require completing at least one mission today before allowing check-in
    const todayStart = getTodayStart();
    const completedMission = await UserMission.findOne({
      user: userId,
      status: "completed",
      createdAt: { $gte: todayStart },
    });

    if (!completedMission) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn phải hoàn thành ít nhất một nhiệm vụ trong trang Nhiệm vụ trước khi điểm danh hôm nay",
      });
    }

    // Calculate coins based on day of week
    const coinsMap = {
      1: 200, // Monday
      2: 100, // Tuesday
      3: 100, // Wednesday
      4: 100, // Thursday
      5: 150, // Friday
      6: 300, // Saturday
      0: 300, // Sunday
    };
    const coins = coinsMap[dayOfWeek] || 100;

    // Calculate streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayCheckIn = await CheckIn.findOne({
      userId,
      checkInDate: yesterday,
    });

    const streak = yesterdayCheckIn ? yesterdayCheckIn.streak + 1 : 1;

    // Add bonus coins for streaks (3, 7, 14, 30 days)
    let bonusCoins = 0;
    if (streak === 3 || streak === 7 || streak === 14 || streak === 30) {
      bonusCoins = 50;
    }

    const totalCoins = coins + bonusCoins;

    // Create check-in record
    const checkInRecord = await CheckIn.create({
      userId,
      checkInDate: today,
      dayOfWeek,
      coins: totalCoins,
      streak,
      weekStart,
    });

    // Update user's coins
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: totalCoins } },
      { new: true }
    );

    // Record as a completed mission for the user so it appears in missions/activity
    try {
      // find or create a canonical 'daily check-in' mission
      let checkinMission = await Mission.findOne({ alias: "checkin_daily" });
      if (!checkinMission) {
        checkinMission = await Mission.create({
          name: "Điểm danh hàng ngày",
          description: "Nhận thưởng khi điểm danh hàng ngày",
          provider: "",
          url: "/checkin",
          shortcut: "",
          alias: "checkin_daily",
          code: "",
          reward: 0,
          uses: 0,
          singleUsePerUser: true,
          status: "active",
        });
      }

      // resolve client IP for record (same logic as missions)
      const resolveClientIp = (req) => {
        const xf =
          req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
        if (xf) {
          const s = Array.isArray(xf) ? xf[0] : String(xf);
          return s.split(",")[0].trim();
        }
        return (
          req.ip ||
          req.connection?.remoteAddress ||
          req.socket?.remoteAddress ||
          null
        );
      };
      const clientIp = resolveClientIp(req);

      // create a completed UserMission record tied to the canonical mission
      await UserMission.create({
        user: userId,
        mission: checkinMission._id,
        rewardGiven: totalCoins,
        ip: clientIp || "",
        deviceInfo: req.headers["user-agent"] || "",
        status: "completed",
      });

      // increment mission uses
      checkinMission.uses = (checkinMission.uses || 0) + 1;
      await checkinMission.save();
    } catch (e) {
      // don't block check-in success if mission recording fails; log to console
      console.error("Error recording check-in as mission:", e?.message || e);
    }

    res.status(201).json({
      success: true,
      message: `Điểm danh thành công! Bạn nhận được ${totalCoins} xu${
        bonusCoins > 0 ? ` (bao gồm ${bonusCoins} xu thưởng chuỗi)` : ""
      }`,
      data: {
        checkIn: {
          date: checkInRecord.checkInDate,
          dayOfWeek: checkInRecord.dayOfWeek,
          coins: checkInRecord.coins,
          streak: checkInRecord.streak,
        },
        totalCoins: user.coins,
        streak,
      },
    });
  } catch (error) {
    next(error);
  }
};
