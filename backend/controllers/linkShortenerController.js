import APIProvider from "../models/APIProvider.js";
import ShortenedLink from "../models/ShortenedLink.js";
import {
  shortenUrl,
  getAccountStats,
  checkLinkStats,
  testProviderConnection,
} from "../services/providerService.js";
import { hashIP, getClientIP } from "../utils/security.js";

// Shorten URL using a provider
export const shortenLink = async (req, res) => {
  try {
    const { provider, url, alias, type, notes } = req.body;

    if (!provider || !url) {
      return res.status(400).json({
        success: false,
        message: "Provider và URL là bắt buộc",
      });
    }

    // Get provider config from database
    const providerConfig = await APIProvider.findOne({
      provider,
      status: "active",
    });

    if (!providerConfig) {
      return res.status(404).json({
        success: false,
        message: "Nhà cung cấp không tồn tại hoặc chưa được kích hoạt",
      });
    }

    // Call provider service
    const result = await shortenUrl(provider, providerConfig.apiKey, url, {
      alias,
      type,
    });

    if (result.success) {
      // Update provider stats
      providerConfig.totalRequests += 1;
      providerConfig.lastUsed = new Date();
      await providerConfig.save();

      // Save to database
      const clientIP = getClientIP(req);
      const hashedIP = hashIP(clientIP);

      const shortenedLink = new ShortenedLink({
        userId: req.user?._id || null,
        adminId: req.admin?._id || null,
        provider,
        providerDomain: providerConfig.domain,
        originalUrl: url,
        shortenedUrl: result.shortenedUrl,
        slug: result.slug || null,
        customAlias: alias || null,
        metadata: {
          remaining: result.remaining,
          campaignType: type,
        },
        creatorIP: hashedIP,
        notes: notes || null,
      });

      await shortenedLink.save();

      // Add database ID to response
      result.linkId = shortenedLink._id;
    }

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error shortening link:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi rút ngắn link",
    });
  }
};

// Get provider account statistics
export const getProviderStats = async (req, res) => {
  try {
    const { provider } = req.params;

    const providerConfig = await APIProvider.findOne({
      provider,
      status: "active",
    });

    if (!providerConfig) {
      return res.status(404).json({
        success: false,
        message: "Nhà cung cấp không tồn tại",
      });
    }

    const result = await getAccountStats(provider, providerConfig.apiKey);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error getting provider stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê",
    });
  }
};

// Check link statistics
export const getLinkStats = async (req, res) => {
  try {
    const { provider, slug } = req.params;

    const providerConfig = await APIProvider.findOne({
      provider,
      status: "active",
    });

    if (!providerConfig) {
      return res.status(404).json({
        success: false,
        message: "Nhà cung cấp không tồn tại",
      });
    }

    const result = await checkLinkStats(provider, providerConfig.apiKey, slug);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error getting link stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê link",
    });
  }
};

// Test provider connection
export const testProvider = async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Provider và API Key là bắt buộc",
      });
    }

    const result = await testProviderConnection(provider, apiKey);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error testing provider:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi test kết nối",
    });
  }
};

// Get link history (for admin/user)
export const getLinkHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, provider, status } = req.query;
    const userId = req.user?._id;
    const adminId = req.admin?._id;

    const query = {};
    if (userId) query.userId = userId;
    if (adminId) query.adminId = adminId;
    if (provider) query.provider = provider;
    if (status) query.status = status;

    const links = await ShortenedLink.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("userId", "username email")
      .populate("adminId", "username email");

    const total = await ShortenedLink.countDocuments(query);

    res.json({
      success: true,
      data: links,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting link history:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử link",
    });
  }
};

// Get single link details
export const getLinkDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await ShortenedLink.findById(id)
      .populate("userId", "username email")
      .populate("adminId", "username email");

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link không tồn tại",
      });
    }

    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error("Error getting link details:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin link",
    });
  }
};

// Update link status
export const updateLinkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const link = await ShortenedLink.findById(id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link không tồn tại",
      });
    }

    if (status) link.status = status;
    if (notes !== undefined) link.notes = notes;

    await link.save();

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: link,
    });
  } catch (error) {
    console.error("Error updating link status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái",
    });
  }
};

// Delete link
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await ShortenedLink.findByIdAndDelete(id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Xóa link thành công",
    });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa link",
    });
  }
};

// Get statistics overview
export const getStatsOverview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const adminId = req.admin?._id;

    const query = {};
    if (userId) query.userId = userId;
    if (adminId) query.adminId = adminId;

    const total = await ShortenedLink.countDocuments(query);
    const active = await ShortenedLink.countDocuments({
      ...query,
      status: "active",
    });
    const inactive = await ShortenedLink.countDocuments({
      ...query,
      status: "inactive",
    });
    const expired = await ShortenedLink.countDocuments({
      ...query,
      status: "expired",
    });

    // Get stats by provider
    const byProvider = await ShortenedLink.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
          totalClicks: { $sum: "$clicks" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent links
    const recentLinks = await ShortenedLink.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("originalUrl shortenedUrl provider status createdAt clicks");

    res.json({
      success: true,
      data: {
        overview: {
          total,
          active,
          inactive,
          expired,
        },
        byProvider,
        recentLinks,
      },
    });
  } catch (error) {
    console.error("Error getting stats overview:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê tổng quan",
    });
  }
};
