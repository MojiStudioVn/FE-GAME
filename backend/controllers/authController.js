import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import UserMission from "../models/UserMission.js";
import Mission from "../models/Mission.js";
import Log from "../models/Log.js";
import { createUserLog } from "../utils/logService.js";
import { config } from "../config/env.js";

// Generate JWT Token
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, config.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check MongoDB connection
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        message: "Database chưa kết nối. Vui lòng thử lại sau.",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          userExists.email === email
            ? "Email đã được sử dụng"
            : "Tên người dùng đã được sử dụng",
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          coins: user.coins,
          level: user.level,
          experience: user.experience,
          avatar: user.avatar,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check MongoDB connection
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        message: "Database chưa kết nối. Vui lòng thử lại sau.",
      });
    }

    // Check for user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    // Decide cookie options safely:
    // - Browsers require `SameSite=None` cookies to also have `Secure=true`.
    // - For local dev over http, use `SameSite='lax'` so the cookie is accepted.
    // - For HTTPS (production or behind ngrok with https), use `SameSite='none'` and `Secure=true`.
    const isSecureRequest =
      req.secure ||
      req.headers["x-forwarded-proto"] === "https" ||
      config.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: Boolean(isSecureRequest),
      sameSite: isSecureRequest ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };

    res.cookie("token", token, cookieOptions);
    // Also store token in session for compatibility
    if (req.session) req.session.token = token;

    // Record login log with client IP and device info
    const resolveClientIp = (r) => {
      const xf = r.headers["x-forwarded-for"] || r.headers["X-Forwarded-For"];
      if (xf)
        return (Array.isArray(xf) ? xf[0] : String(xf)).split(",")[0].trim();
      return (
        r.ip || r.connection?.remoteAddress || r.socket?.remoteAddress || null
      );
    };
    const clientIp = resolveClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    try {
      await createUserLog(req, {
        message: `User logged in: ${user.username}`,
        source: "backend",
        page: "/login",
        meta: {
          type: "login",
          ip: clientIp,
          userAgent,
          success: true,
        },
        userId: String(user._id),
        userEmail: user.email,
        userName: user.username,
      });
    } catch (logErr) {
      console.warn("Failed to create login log:", logErr);
    }

    // Return user data and a note that cookie is set. Frontend should prefer cookie-based auth
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          coins: user.coins,
          level: user.level,
          experience: user.experience,
          avatar: user.avatar,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        // token still provided for clients that prefer header-based auth; do not store it in localStorage if possible
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (clears auth cookie/session)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Clear cookie
    res.clearCookie("token", { path: "/" });
    if (req.session) req.session.token = null;

    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        coins: user.coins,
        level: user.level,
        experience: user.experience,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user dashboard (personalized)
// @route   GET /api/auth/me/dashboard
// @access  Private
export const getMyDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role || "user";

    const user = await User.findById(userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const coins = user.coins || 0;

    // Missions completed by this user
    const missionsCompleted = await UserMission.countDocuments({
      user: userId,
    });

    // Total missions in system (used as the denominator for progress)
    const totalMissions = await Mission.countDocuments();

    // Users online approximation: users active in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const usersOnline = await User.countDocuments({
      updatedAt: { $gte: fiveMinutesAgo },
    });

    // Rank by coins (1 = highest)
    const higherCount = await User.countDocuments({ coins: { $gt: coins } });
    const rank = higherCount + 1;

    // Recent activities for this user (from logs)
    // Build search conditions only for defined values to avoid matching undefined
    const searchConds = [];
    try {
      if (userId) searchConds.push({ userId: String(userId) });
    } catch (e) {
      // ignore cast issues
    }
    if (user.email) searchConds.push({ userEmail: user.email });
    if (userId) searchConds.push({ "meta.userId": String(userId) });
    if (user.email) searchConds.push({ "meta.userEmail": user.email });

    let recentLogs = [];
    if (searchConds.length > 0) {
      recentLogs = await Log.find({ $or: searchConds })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();
      recentLogs = recentLogs.filter((l) => {
        const actorRole = l.meta && l.meta.actorRole;
        const logUserId = l.userId || l.meta?.userId || null;
        return !(actorRole === "admin" && String(logUserId) !== String(userId));
      });

      // Loại bỏ các log liên quan đến 'token refresh' khỏi danh sách hiển thị
      recentLogs = recentLogs.filter((l) => {
        const metaType = String(l.meta?.type || "").toLowerCase();
        const msg = String(l.message || "").toLowerCase();
        // Nếu meta.type là token_refresh hoặc message có từ 'refresh'/'refreshed' thì bỏ
        if (metaType === "token_refresh") return false;
        if (/refresh|refreshed/.test(msg)) return false;
        return true;
      });
    }

    const formattedLogs = recentLogs.map((log) => {
      const coinsMeta = log.meta?.coins || 0;
      // Default action text
      let actionText = log.message || "";

      // metaType (normalized) - declare early so enrichers can use it
      const metaType = String(log.meta?.type || "").toLowerCase();

      // Map token refresh / logout even when `meta.type` wasn't set
      if (
        metaType === "token_refresh" ||
        /refreshed/i.test(log.message || "")
      ) {
        actionText = "Làm mới token";
      }

      if (
        metaType === "logout" ||
        /logged out|logout|sign out/i.test(log.message || "")
      ) {
        actionText = "Đăng xuất";
      }

      // Enrich messages for known meta types
      if (metaType === "mission_complete") {
        const mName =
          log.meta?.missionName || log.meta?.missionId || "(nhiệm vụ)";
        const amount = Number(log.meta?.amount || 0);
        const oldCoins = Number(log.meta?.oldCoins ?? 0);
        const newCoins = Number(log.meta?.newCoins ?? 0);
        const sign = amount > 0 ? "+" : "";
        actionText = `Hoàn thành nhiệm vụ ${mName} — ${sign}${amount} xu (${oldCoins} → ${newCoins})`;
      }

      if (metaType === "login") {
        const ip = log.meta?.ip || "-";
        const ua = log.meta?.userAgent || "";
        actionText = `Đăng nhập từ IP ${ip}${ua ? " - " + ua : ""}`;
      }

      // Special handling for card-related logs to show user-friendly card info
      // card recharge formatting
      if (metaType === "card_recharge" || /card_recharge/.test(metaType)) {
        const coinAmt = Number(log.meta?.amount || 0);
        const oldCoins = Number(log.meta?.oldCoins ?? 0);
        const newCoins = Number(log.meta?.newCoins ?? 0);
        if (coinAmt) {
          const sign = coinAmt > 0 ? "+" : "";
          actionText = `Nạp thẻ: ${sign}${coinAmt} xu (${oldCoins} → ${newCoins})`;
        }
      }
      if (
        metaType.includes("card") ||
        /gửi thẻ|nạp thẻ|mua thẻ/i.test(log.message || "")
      ) {
        const code =
          log.meta?.code ||
          log.meta?.cardCode ||
          log.meta?.card_code ||
          log.meta?.codeMasked ||
          log.meta?.cardCodeMasked ||
          log.meta?.code_masked ||
          "-";
        const serial =
          log.meta?.serial ||
          log.meta?.cardSerial ||
          log.meta?.card_serial ||
          log.meta?.serialMasked ||
          log.meta?.serial_masked ||
          "-";
        const value =
          log.meta?.declaredValue ||
          log.meta?.cardValue ||
          log.meta?.value ||
          log.meta?.card_value ||
          "-";
        const telco = log.meta?.telco || "-";

        actionText = `NẠP THẺ: MÃ THẺ: ${code || "-"} - SERIAL: ${
          serial || "-"
        } - MỆNH GIÁ: ${value || "-"} - LOẠI THẺ: ${telco || "-"}`;
      }

      return {
        id: log._id,
        type: (log.meta && log.meta.type) || (log.message || "").toLowerCase(),
        user: log.userName || log.userId?.username || log.userEmail || "System",
        action: actionText,
        amount:
          coinsMeta !== 0 ? `${coinsMeta > 0 ? "+" : ""}${coinsMeta} xu` : "",
        time: (() => {
          const seconds = Math.floor(
            (Date.now() - new Date(log.timestamp)) / 1000
          );
          if (seconds < 60) return `${seconds} giây trước`;
          if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
          if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
          return `${Math.floor(seconds / 86400)} ngày trước`;
        })(),
        status:
          log.level === "error" ? "failed" : log.meta?.status || "success",
        meta: log.meta || {},
      };
    });

    res.status(200).json({
      success: true,
      data: {
        coins,
        missionsCompleted,
        totalMissions,
        usersOnline,
        rank,
        recentActivities: formattedLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Update fields
    if (username) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        coins: user.coins,
        level: user.level,
        experience: user.experience,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
