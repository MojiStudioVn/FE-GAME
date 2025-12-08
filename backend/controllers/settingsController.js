import SystemSettings from "../models/SystemSettings.js";
import AdminLog from "../models/AdminLog.js";
import CardTransaction from "../models/CardTransaction.js";
import settingsCache from "../utils/settingsCache.js";

// Get system settings (create default if not exists)
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    // Create default settings if not exists
    if (!settings) {
      settings = await SystemSettings.create({
        siteBrand: "Game Platform",
        cspMode: "moderate",
        cardHistoryRetentionDays: 90,
        rateLimitWindowMs: 900000,
        rateLimitMax: 100,
        httpsEnabled: false,
        sessionMaxAge: 604800000,
        adminSessionMaxAge: 86400000,
        maxFileSize: 10485760,
        maxFiles: 10,
        allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      });
    }

    res.status(200).json({
      success: true,
      settings: {
        siteBrand: settings.siteBrand,
        cspMode: settings.cspMode,
        cardHistoryRetentionDays: settings.cardHistoryRetentionDays,
        rateLimitWindowMs: settings.rateLimitWindowMs,
        rateLimitMax: settings.rateLimitMax,
        httpsEnabled: settings.httpsEnabled,
        sessionMaxAge: settings.sessionMaxAge,
        adminSessionMaxAge: settings.adminSessionMaxAge,
        maxFileSize: settings.maxFileSize,
        maxFiles: settings.maxFiles,
        allowedFileTypes: settings.allowedFileTypes,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy cài đặt",
    });
  }
};

// Update system settings
export const updateSettings = async (req, res) => {
  try {
    const {
      siteBrand,
      cspMode,
      cardHistoryRetentionDays,
      rateLimitWindowMs,
      rateLimitMax,
      httpsEnabled,
      sessionMaxAge,
      adminSessionMaxAge,
      maxFileSize,
      maxFiles,
      allowedFileTypes,
    } = req.body;

    // Validation
    if (
      cardHistoryRetentionDays &&
      (cardHistoryRetentionDays < 1 || cardHistoryRetentionDays > 365)
    ) {
      return res.status(400).json({
        success: false,
        message: "Số ngày lưu trữ phải từ 1-365",
      });
    }

    if (
      cspMode &&
      !["report-only", "enforce", "strict", "moderate", "relaxed"].includes(
        cspMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "CSP Mode không hợp lệ",
      });
    }

    if (
      rateLimitWindowMs &&
      (rateLimitWindowMs < 60000 || rateLimitWindowMs > 3600000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rate limit window phải từ 1 phút đến 1 giờ",
      });
    }

    if (rateLimitMax && (rateLimitMax < 10 || rateLimitMax > 10000)) {
      return res.status(400).json({
        success: false,
        message: "Rate limit max phải từ 10 đến 10000",
      });
    }

    let settings = await SystemSettings.findOne();

    // Create if not exists
    if (!settings) {
      settings = new SystemSettings();
    }

    // Update fields
    if (siteBrand !== undefined) settings.siteBrand = siteBrand;
    if (cspMode !== undefined) settings.cspMode = cspMode;
    if (cardHistoryRetentionDays !== undefined)
      settings.cardHistoryRetentionDays = cardHistoryRetentionDays;
    if (rateLimitWindowMs !== undefined)
      settings.rateLimitWindowMs = rateLimitWindowMs;
    if (rateLimitMax !== undefined) settings.rateLimitMax = rateLimitMax;
    if (httpsEnabled !== undefined) settings.httpsEnabled = httpsEnabled;
    if (sessionMaxAge !== undefined) settings.sessionMaxAge = sessionMaxAge;
    if (adminSessionMaxAge !== undefined)
      settings.adminSessionMaxAge = adminSessionMaxAge;
    if (maxFileSize !== undefined) settings.maxFileSize = maxFileSize;
    if (maxFiles !== undefined) settings.maxFiles = maxFiles;
    if (allowedFileTypes !== undefined)
      settings.allowedFileTypes = allowedFileTypes;

    await settings.save();

    // Clear cache after update
    settingsCache.clearCache();

    // Log the action
    await AdminLog.create({
      adminId: req.admin._id,
      action: "update_settings",
      details: `Cập nhật cài đặt hệ thống`,
      metadata: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật cài đặt thành công",
      settings: {
        siteBrand: settings.siteBrand,
        cspMode: settings.cspMode,
        cardHistoryRetentionDays: settings.cardHistoryRetentionDays,
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật cài đặt",
    });
  }
};

// Get health statistics
export const getHealthStats = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();

    if (!settings) {
      return res.status(200).json({
        success: true,
        stats: {
          totalCleanedRecords: 0,
          retentionDays: 90,
          lastCleanup: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalCleanedRecords: settings.cleanupCount || 0,
        retentionDays: settings.cardHistoryRetentionDays || 90,
        lastCleanup: settings.lastCleanup || null,
      },
    });
  } catch (error) {
    console.error("Error fetching health stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê",
    });
  }
};

// Run cleanup now (delete old card transactions)
export const runCleanupNow = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: "Cài đặt hệ thống chưa được khởi tạo",
      });
    }

    const retentionDays = settings.cardHistoryRetentionDays || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Delete old card transactions
    const result = await CardTransaction.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    // Update cleanup stats
    settings.cleanupCount = (settings.cleanupCount || 0) + result.deletedCount;
    settings.lastCleanup = new Date();
    await settings.save();

    // Log the action
    await AdminLog.create({
      adminId: req.admin._id,
      action: "run_cleanup",
      details: `Dọn dẹp ${result.deletedCount} bản ghi cũ hơn ${retentionDays} ngày`,
      metadata: { deletedCount: result.deletedCount, retentionDays },
    });

    res.status(200).json({
      success: true,
      message: "Dọn dẹp thành công",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error running cleanup:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi dọn dẹp",
    });
  }
};
