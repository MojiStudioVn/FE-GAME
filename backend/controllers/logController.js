import Log from "../models/Log.js";
import jwt from "jsonwebtoken";
import { extractToken } from "../middleware/auth.js";
import { config } from "../config/env.js";

// @desc    Create log
// @route   POST /api/logs
// @access  Public (will attach user info when token provided)
export const createLog = async (req, res) => {
  try {
    const { level, message, source, page, stack } = req.body;
    let { meta } = req.body;

    // Resolve client IP (honor X-Forwarded-For)
    const resolveClientIp = (r) => {
      const xf = r.headers["x-forwarded-for"] || r.headers["X-Forwarded-For"];
      if (xf) {
        const s = Array.isArray(xf) ? xf[0] : String(xf);
        return s.split(",")[0].trim();
      }
      return (
        r.ip || r.connection?.remoteAddress || r.socket?.remoteAddress || null
      );
    };
    const clientIp = resolveClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    // Try to extract token and decode user info if present
    let userId = null;
    let userEmail = null;
    try {
      const { token } = extractToken(req);
      if (token) {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded) {
          userId = decoded.id || decoded._id || null;
          userEmail = decoded.email || null;
        }
      }
    } catch (e) {
      // ignore token decode failures - do not reject the log create
    }

    // Ensure meta is an object
    if (!meta || typeof meta !== "object") meta = {};
    // Merge IP and device info into meta unless already provided
    if (!meta.ip) meta.ip = clientIp;
    if (!meta.deviceInfo) meta.deviceInfo = userAgent;

    const log = await Log.create({
      level: level || "info",
      message,
      source: source || "frontend",
      page,
      userId,
      userEmail,
      stack,
      meta,
    });

    res.status(201).json({
      success: true,
      message: "Log đã được ghi lại",
      data: log,
    });
  } catch (error) {
    console.error("❌ Lỗi khi ghi log:", error);
    res.status(500).json({
      success: false,
      message: "Không thể ghi log",
      error: error.message,
    });
  }
};

// @desc    Get logs with pagination and filters
// @route   GET /api/logs
// @access  Private/Admin
export const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      level,
      source,
      userId,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (level) query.level = level;
    if (source) query.source = source;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      const timestampQuery = {};
      if (startDate) timestampQuery.$gte = new Date(startDate);
      if (endDate) timestampQuery.$lte = new Date(endDate);
      query.timestamp = timestampQuery;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      Log.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Log.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy logs:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy logs",
      error: error.message,
    });
  }
};

// @desc    Delete old logs
// @route   DELETE /api/logs
// @access  Private/Admin
export const deleteLogs = async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const result = await Log.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} logs cũ hơn ${days} ngày`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa logs:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa logs",
      error: error.message,
    });
  }
};

// @desc    Get log statistics
// @route   GET /api/logs/stats
// @access  Private/Admin
export const getLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      const timestampQuery = {};
      if (startDate) timestampQuery.$gte = new Date(startDate);
      if (endDate) timestampQuery.$lte = new Date(endDate);
      matchQuery.timestamp = timestampQuery;
    }

    const stats = await Log.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            level: "$level",
            source: "$source",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.source",
          levels: {
            $push: {
              level: "$_id.level",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê logs:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
      error: error.message,
    });
  }
};
