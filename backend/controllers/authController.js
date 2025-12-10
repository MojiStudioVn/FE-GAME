import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import UserMission from "../models/UserMission.js";
import Mission from "../models/Mission.js";
import Log from "../models/Log.js";
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
        token,
      },
    });
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
    // Search common fields and also meta.* fields in case logs store user info there
    const recentLogs = await Log.find({
      $or: [
        { userId: userId },
        { userEmail: user.email },
        { "meta.userId": userId },
        { "meta.userEmail": user.email },
        { "meta.user": user.username },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const formattedLogs = recentLogs.map((log) => {
      const coinsMeta = log.meta?.coins || 0;
      return {
        id: log._id,
        type: (log.meta && log.meta.type) || (log.message || "").toLowerCase(),
        user: log.userId?.username || log.userEmail || "System",
        action: log.message,
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
