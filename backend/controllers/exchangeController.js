// Simple exchange controller to expose package data for frontend
import AccountListing from "../models/AccountListing.js";
import User from "../models/User.js";
import AdminLog from "../models/AdminLog.js";
import Purchase from "../models/Purchase.js";
import { createUserLog } from "../utils/logService.js";

const staticPackages = [
  {
    id: "ss",
    name: "ACC SS",
    label: "GÓI PHỔ THÔNG",
    price: 300,
    limit: 199725,
    description: "Thanh toán thẳng từ số xu trong ví của bạn.",
    tradeDelay: "Trừ xu xong hệ thống trả ACC ngay tại đây.",
    features: [
      "Gói acc giá mềm, ưu tiên nhiều skin & lịch sử sạch.",
      "Acc random từ file admin up, ưu tiên acc sạch & ít tranh chấp.",
      "Chi tiết TK/MK hiện thị ngay, kèm nút Check Acc để hệ thống test giúp.",
      "Tất cả giao dịch được ghi log để hỗ trợ khi cần.",
    ],
    actionLabel: null,
    actionNote: null,
  },
  {
    id: "sss",
    name: "ACC SSS",
    label: "SIÊU VIP",
    price: 5000,
    limit: null,
    description: "Acc SSS / Anime, chọn trực tiếp tại shop chính thức.",
    tradeDelay: "Thanh toán và chọn ACC ngay trên trang shop riêng.",
    features: [
      "Acc SSS được quản lý tách riêng tại shop chính thức.",
      "Xem trước skin / thông tin acc rõi mới quyết định.",
      "Khuyến nghị chỉ dùng link chính thức bên dưới để tránh giả mạo.",
    ],
    shopUrl: "buiducthuan.pro",
    actionLabel: "Mở shop ACC SSS",
    actionNote: "Shop sẽ mở trong tab mới để bạn tham khảo thoải mái.",
  },
];

export const getPackages = async (req, res) => {
  try {
    // Compute available stock from AccountListing collection
    // SS stock: accountType = 'random' and ssCards array non-empty and active
    // SSS stock: accountType = 'checked-account' and sssCards array non-empty and active
    // Relax SS counting to include any uploaded 'random' accounts
    // (some uploads may not set status or have ssCards populated in the same field)
    const ssCount = await AccountListing.countDocuments({
      accountType: "random",
    });

    // Keep SSS counting stricter (checked accounts with non-empty sssCards and active)
    const sssCount = await AccountListing.countDocuments({
      accountType: { $in: ["checked-account", "checked"] },
      sssCards: { $exists: true, $ne: [] },
      status: "active",
    });

    // Clone packages and set numeric limits based on counts (ensure 0 when empty)
    const packages = staticPackages.map((p) => ({ ...p }));
    const ssPkg = packages.find((p) => p.id === "ss");
    const sssPkg = packages.find((p) => p.id === "sss");
    console.log(`exchangeController: ssCount=${ssCount}, sssCount=${sssCount}`);
    if (ssPkg) ssPkg.limit = typeof ssCount === "number" ? ssCount : 0;
    if (sssPkg) sssPkg.limit = typeof sssCount === "number" ? sssCount : 0;

    return res.json({ success: true, packages });
  } catch (err) {
    console.error("exchangeController.getPackages error", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load packages" });
  }
};

// Public: list SSS shop listings (no passwords)
export const getShopListings = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const query = {
      accountType: { $in: ["checked-account", "checked"] },
      status: "active",
    };

    const [total, docs] = await Promise.all([
      AccountListing.countDocuments(query),
      AccountListing.find(query)
        .select(
          "username ssCards sssCards price level rank images description skins"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.json({ success: true, total, page, limit, listings: docs });
  } catch (err) {
    console.error("exchangeController.getShopListings error", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load shop listings" });
  }
};

export const buyPackage = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const pkgId = req.body?.packageId || req.body?.id;
    if (!pkgId)
      return res
        .status(400)
        .json({ success: false, message: "Missing packageId" });

    // Resolve package metadata (price)
    const pkg = staticPackages.find((p) => p.id === pkgId);
    if (!pkg)
      return res
        .status(400)
        .json({ success: false, message: "Unknown package" });

    const price = Number(pkg.price || 0);
    if (price <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid package price" });

    // Atomically deduct user's coins only if they have enough
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, coins: { $gte: price } },
      { $inc: { coins: -price } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ success: false, message: "Không đủ xu" });
    }

    // Try to find and remove a random account of the requested type
    let account = null;
    if (pkgId === "ss") {
      account = await AccountListing.findOneAndDelete({
        accountType: "random",
      });
    } else if (pkgId === "sss") {
      account = await AccountListing.findOneAndDelete({
        accountType: { $in: ["checked-account", "checked"] },
      });
    }

    if (!account) {
      // rollback coins
      await User.findByIdAndUpdate(userId, { $inc: { coins: price } });
      return res.status(409).json({
        success: false,
        message: "Hiện không có tài khoản phù hợp trong kho",
      });
    }

    // Persist purchased account snapshot so the buyer can view it later
    let purchaseRecord = null;
    try {
      purchaseRecord = await Purchase.create({
        buyerId: userId,
        packageId: pkgId,
        price,
        accountSnapshot: {
          username: account.username,
          password: account.password,
          ssCards: account.ssCards || [],
          sssCards: account.sssCards || [],
          skins: account.skins || account.skin || [],
          level: account.level,
          rank: account.rank,
        },
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      });
    } catch (e) {
      console.warn("Purchase create failed", e);
    }

    // Log the purchase for auditing (user log) and include purchaseId
    try {
      await createUserLog(req, {
        level: "info",
        message: `Mua gói ${pkgId} - giá ${price} xu`,
        meta: {
          packageId: pkgId,
          price,
          accountId: account._id,
          accountUsername: account.username,
          purchaseId: purchaseRecord ? purchaseRecord._id : undefined,
        },
      });
    } catch (e) {
      // non-fatal
      console.warn("createUserLog failed", e);
    }

    // Create an admin-facing log entry to track inventory changes
    try {
      await AdminLog.create({
        adminId: userId,
        action: "exchange:purchase",
        details: `User ${userId} purchased package ${pkgId} for ${price} coins and received account ${account.username}`,
        metadata: { packageId: pkgId, price, accountId: account._id },
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      });
    } catch (e) {
      console.warn("AdminLog create failed", e);
    }

    // Return the account credentials to the user (safely)
    const responseAccount = {
      username: account.username,
      password: account.password,
      ssCards: account.ssCards || [],
      sssCards: account.sssCards || [],
      price: account.price || null,
    };

    return res.json({
      success: true,
      message: "Mua thành công",
      account: responseAccount,
      remainingCoins: updatedUser.coins,
    });
  } catch (err) {
    console.error("exchangeController.buyPackage error", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi xử lý yêu cầu mua" });
  }
};

export default { getPackages, buyPackage };
