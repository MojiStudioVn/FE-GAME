import GiftToken from "../models/GiftToken.js";
import GiftTokenUsage from "../models/GiftTokenUsage.js";
import Log from "../models/Log.js";

// Generate random token code
const generateTokenCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create new gift token
export const createGiftToken = async (req, res) => {
  try {
    let { code, coins, maxUses, expiresAt } = req.body;

    // Validate required fields
    if (!coins || !maxUses) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // Generate code if not provided
    if (!code || code.trim() === "") {
      let isUnique = false;
      while (!isUnique) {
        code = generateTokenCode();
        const existing = await GiftToken.findOne({ code });
        if (!existing) isUnique = true;
      }
    } else {
      // Check if code already exists
      const existingToken = await GiftToken.findOne({
        code: code.toUpperCase(),
      });

      if (existingToken) {
        return res.status(400).json({
          message: "Mã quà tặng này đã tồn tại",
        });
      }
    }

    // Set default expiry date if not provided (30 days from now)
    if (!expiresAt) {
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 30);
      expiresAt = defaultExpiry;
    } else {
      // Validate expiry date
      if (new Date(expiresAt) <= new Date()) {
        return res.status(400).json({
          message: "Thời hạn phải lớn hơn thời gian hiện tại",
        });
      }
    }

    // Create gift token
    const giftToken = new GiftToken({
      code: code.toUpperCase(),
      coins: parseInt(coins),
      maxUses: parseInt(maxUses),
      expiresAt: new Date(expiresAt),
      createdBy: req.user.userId,
    });

    await giftToken.save();

    // Create log
    await Log.create({
      user: req.user.userId,
      action: "CREATE_GIFT_TOKEN",
      description: `Tạo mã quà tặng: ${giftToken.code} (${giftToken.coins} xu, tối đa ${giftToken.maxUses} lần)`,
    });

    res.status(201).json({
      message: "Tạo mã quà tặng thành công",
      giftToken,
    });
  } catch (error) {
    console.error("Error creating gift token:", error);
    res.status(500).json({
      message: "Lỗi server khi tạo mã quà tặng",
      error: error.message,
    });
  }
};

// Get all gift tokens
export const getAllGiftTokens = async (req, res) => {
  try {
    const giftTokens = await GiftToken.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      giftTokens,
    });
  } catch (error) {
    console.error("Error fetching gift tokens:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách mã quà tặng",
      error: error.message,
    });
  }
};

// Toggle gift token status (enable/disable)
export const toggleGiftToken = async (req, res) => {
  try {
    const { id } = req.params;

    const giftToken = await GiftToken.findById(id);

    if (!giftToken) {
      return res.status(404).json({
        message: "Không tìm thấy mã quà tặng",
      });
    }

    giftToken.isEnabled = !giftToken.isEnabled;
    await giftToken.save();

    // Create log
    await Log.create({
      user: req.user.userId,
      action: "TOGGLE_GIFT_TOKEN",
      description: `${
        giftToken.isEnabled ? "Kích hoạt" : "Vô hiệu hóa"
      } mã quà tặng: ${giftToken.code}`,
    });

    res.json({
      message: `${
        giftToken.isEnabled ? "Kích hoạt" : "Vô hiệu hóa"
      } mã quà tặng thành công`,
      giftToken,
    });
  } catch (error) {
    console.error("Error toggling gift token:", error);
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái mã quà tặng",
      error: error.message,
    });
  }
};

// Delete gift token
export const deleteGiftToken = async (req, res) => {
  try {
    const { id } = req.params;

    const giftToken = await GiftToken.findById(id);

    if (!giftToken) {
      return res.status(404).json({
        message: "Không tìm thấy mã quà tặng",
      });
    }

    // Delete associated usage records
    await GiftTokenUsage.deleteMany({ giftToken: id });

    // Delete the token
    await GiftToken.findByIdAndDelete(id);

    // Create log
    await Log.create({
      user: req.user.userId,
      action: "DELETE_GIFT_TOKEN",
      description: `Xóa mã quà tặng: ${giftToken.code}`,
    });

    res.json({
      message: "Xóa mã quà tặng thành công",
    });
  } catch (error) {
    console.error("Error deleting gift token:", error);
    res.status(500).json({
      message: "Lỗi server khi xóa mã quà tặng",
      error: error.message,
    });
  }
};

// Get token usage history
export const getTokenUsageHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const usageHistory = await GiftTokenUsage.find({ giftToken: id })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      usageHistory,
    });
  } catch (error) {
    console.error("Error fetching token usage history:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy lịch sử sử dụng",
      error: error.message,
    });
  }
};

// Export gift tokens to CSV
export const exportGiftTokens = async (req, res) => {
  try {
    const giftTokens = await GiftToken.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    // CSV header
    let csv = "\uFEFF"; // UTF-8 BOM
    csv += "Mã,Số xu,Đã dùng,Tối đa,Trạng thái,Hết hạn,Người tạo,Ngày tạo\n";

    // CSV rows
    giftTokens.forEach((token) => {
      const status = token.isEnabled ? "Hoạt động" : "Tắt";
      const expiresAt = new Date(token.expiresAt).toLocaleDateString("vi-VN");
      const createdAt = new Date(token.createdAt).toLocaleDateString("vi-VN");
      const createdBy = token.createdBy?.username || "N/A";

      csv += `${token.code},${token.coins},${token.usedCount},${token.maxUses},${status},${expiresAt},${createdBy},${createdAt}\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gift-tokens.csv"
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting gift tokens:", error);
    res.status(500).json({
      message: "Lỗi server khi xuất CSV",
      error: error.message,
    });
  }
};
