import AccountListing from "../models/AccountListing.js";
import AdminLog from "../models/AdminLog.js";
import UploadJob from "../models/UploadJob.js";

// Auto-parse blob text (username:password\nHeroes:...\nSkins:...\nSS:...\nSSS:...\nLevel:...\nRank:...\nCountry:...)
const parseAccountBlob = (blob) => {
  const lines = blob
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const data = {
    username: "",
    password: "",
    heroes: [],
    skins: [],
    ssCards: [],
    sssCards: [],
    level: 1,
    rank: "Unranked",
    country: "Vietnam",
  };

  for (const line of lines) {
    // Parse username:password
    if (
      line.includes(":") &&
      !line.toLowerCase().startsWith("heroes") &&
      !line.toLowerCase().startsWith("skins")
    ) {
      const parts = line.split(":");
      if (parts.length === 2 && !data.username) {
        data.username = parts[0].trim();
        data.password = parts[1].trim();
        continue;
      }
    }

    // Parse Heroes
    if (
      line.toLowerCase().startsWith("heroes:") ||
      line.toLowerCase().startsWith("tướng:")
    ) {
      const heroText = line.split(":")[1]?.trim() || "";
      data.heroes = heroText
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
    }

    // Parse Skins
    if (
      line.toLowerCase().startsWith("skins:") ||
      line.toLowerCase().startsWith("skin:")
    ) {
      const skinText = line.split(":")[1]?.trim() || "";
      data.skins = skinText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Parse SS Cards
    if (line.toLowerCase().startsWith("ss:")) {
      const ssText = line.split(":")[1]?.trim() || "";
      data.ssCards = ssText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Parse SSS Cards
    if (line.toLowerCase().startsWith("sss:")) {
      const sssText = line.split(":")[1]?.trim() || "";
      data.sssCards = sssText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Parse Level
    if (
      line.toLowerCase().startsWith("level:") ||
      line.toLowerCase().startsWith("cấp:")
    ) {
      const levelText = line.split(":")[1]?.trim() || "1";
      data.level = parseInt(levelText) || 1;
    }

    // Parse Rank
    if (
      line.toLowerCase().startsWith("rank:") ||
      line.toLowerCase().startsWith("hạng:")
    ) {
      data.rank = line.split(":")[1]?.trim() || "Unranked";
    }

    // Parse Country
    if (
      line.toLowerCase().startsWith("country:") ||
      line.toLowerCase().startsWith("quốc gia:")
    ) {
      data.country = line.split(":")[1]?.trim() || "Vietnam";
    }
  }

  return data;
};

// Generate auto description based on heroes and skins
const generateDescription = (heroes, skins, ssCards, sssCards, level, rank) => {
  let desc = `🎮 ACC GAME CHẤT LƯỢNG CAO\n\n`;

  if (level) desc += `⭐ Cấp độ: ${level}\n`;
  if (rank && rank !== "Unranked") desc += `🏆 Hạng: ${rank}\n\n`;

  if (heroes.length > 0) {
    desc += `🦸 Tướng: ${heroes.join(", ")}\n`;
  }

  if (skins.length > 0) {
    desc += `👗 Skin: ${skins.join(", ")}\n`;
  }

  if (ssCards.length > 0) {
    desc += `⭐⭐ SS Cards: ${ssCards.join(", ")}\n`;
  }

  if (sssCards.length > 0) {
    desc += `⭐⭐⭐ SSS Cards: ${sssCards.join(", ")}\n`;
  }

  desc += `\n✅ Bảo hành uy tín\n✅ Giao dịch nhanh chóng\n✅ Hỗ trợ 24/7`;

  return desc;
};

// Upload new account listing
export const uploadAccount = async (req, res) => {
  try {
    const {
      blob,
      saleType,
      price,
      auctionStartPrice,
      auctionStepPrice,
      auctionDuration,
      customDescription,
    } = req.body;

    // Parse blob to extract account info
    const parsedData = parseAccountBlob(blob || "");

    // Validate required fields
    if (!parsedData.username || !parsedData.password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin username:password trong blob",
      });
    }

    // Get uploaded image URLs
    const imageUrls = req.files
      ? req.files.map((file) => `/uploads/accounts/${file.filename}`)
      : [];

    // Generate description if not provided
    const description =
      customDescription ||
      generateDescription(
        parsedData.heroes,
        parsedData.skins,
        parsedData.ssCards,
        parsedData.sssCards,
        parsedData.level,
        parsedData.rank
      );

    // Create account listing
    const accountData = {
      username: parsedData.username,
      password: parsedData.password,
      images: imageUrls,
      heroes: parsedData.heroes,
      skins: parsedData.skins,
      ssCards: parsedData.ssCards,
      sssCards: parsedData.sssCards,
      level: parsedData.level,
      rank: parsedData.rank,
      country: parsedData.country,
      saleType: saleType || "fixed",
      description,
      uploadedBy: req.admin._id,
    };

    // Add pricing based on sale type
    if (saleType === "auction") {
      accountData.auctionStartPrice = parseInt(auctionStartPrice) || 0;
      accountData.auctionStepPrice = parseInt(auctionStepPrice) || 0;
      accountData.auctionDuration = parseInt(auctionDuration) || 24;
      accountData.currentBid = accountData.auctionStartPrice;

      // Calculate end time
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + accountData.auctionDuration);
      accountData.auctionEndTime = endTime;
    } else {
      accountData.price = parseInt(price) || 0;
    }

    const account = await AccountListing.create(accountData);

    // Log action
    await AdminLog.create({
      adminId: req.admin._id,
      action: "upload_account",
      details: `Upload ACC ${parsedData.username} - ${
        saleType === "auction" ? "Đấu giá" : "Mua ngay"
      }`,
      metadata: { accountId: account._id, saleType },
    });

    res.status(201).json({
      success: true,
      message: "Upload ACC thành công",
      account,
    });
  } catch (error) {
    console.error("Error uploading account:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi upload ACC",
    });
  }
};

// Get all account listings (with filters)
export const getAccountListings = async (req, res) => {
  try {
    const {
      status,
      saleType,
      page = 1,
      limit = 20,
      q,
      accountType,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (saleType) filter.saleType = saleType;
    if (accountType) filter.accountType = accountType;

    // price range
    const priceFilter = {};
    if (minPrice !== undefined && minPrice !== null && minPrice !== "")
      priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "")
      priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length > 0) filter.price = priceFilter;

    // text search on username / description
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { username: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const accounts = await AccountListing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("uploadedBy", "username")
      .populate("currentBidder", "username");

    const total = await AccountListing.countDocuments(filter);

    res.status(200).json({
      success: true,
      accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    // Add diagnostic context to help debug failures (safe: do not log tokens)
    try {
      const userInfo = req.user
        ? { id: req.user.id || req.user._id, role: req.user.role }
        : null;
      console.error("Error fetching accounts:", {
        message: error?.message || String(error),
        stack: error?.stack,
        user: userInfo,
        query: {
          status: req.query.status,
          saleType: req.query.saleType,
          page: req.query.page,
          limit: req.query.limit,
        },
      });
    } catch (e) {
      console.error(
        "Error fetching accounts (failed to log diagnostic):",
        error
      );
    }
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách ACC",
    });
  }
};

// Update account listing
export const updateAccountListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const account = await AccountListing.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ACC",
      });
    }

    await AdminLog.create({
      adminId: req.admin._id,
      action: "update_account",
      details: `Cập nhật ACC ${account.username}`,
      metadata: { accountId: account._id },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật ACC thành công",
      account,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật ACC",
    });
  }
};

// Delete account listing
export const deleteAccountListing = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await AccountListing.findByIdAndUpdate(
      id,
      { status: "removed" },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ACC",
      });
    }

    await AdminLog.create({
      adminId: req.admin._id,
      action: "delete_account",
      details: `Xóa ACC ${account.username}`,
      metadata: { accountId: account._id },
    });

    res.status(200).json({
      success: true,
      message: "Xóa ACC thành công",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa ACC",
    });
  }
};

// Parse blob preview (for frontend preview)
export const parseBlob = async (req, res) => {
  try {
    const { blob } = req.body;

    const parsedData = parseAccountBlob(blob);
    const description = generateDescription(
      parsedData.heroes,
      parsedData.skins,
      parsedData.ssCards,
      parsedData.sssCards,
      parsedData.level,
      parsedData.rank
    );

    res.status(200).json({
      success: true,
      parsed: parsedData,
      description,
    });
  } catch (error) {
    console.error("Error parsing blob:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi parse blob",
    });
  }
};

// Auto cleanup sold accounts after 24 hours
export const autoCleanupSoldAccounts = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find sold accounts older than 24 hours
    const soldAccounts = await AccountListing.find({
      status: "sold",
      soldAt: { $lt: twentyFourHoursAgo },
    });

    let deletedCount = 0;
    const fs = await import("fs").then((m) => m.promises);
    const path = await import("path");

    for (const account of soldAccounts) {
      // Delete images from server
      for (const imageUrl of account.images) {
        try {
          const imagePath = path.join(
            process.cwd(),
            "public",
            imageUrl.replace(/^\//, "")
          );
          await fs.unlink(imagePath);
        } catch (err) {
          console.error(`Failed to delete image: ${imageUrl}`, err);
        }
      }

      // Delete the account record
      await AccountListing.findByIdAndDelete(account._id);
      deletedCount++;
    }

    console.log(
      `Auto cleanup: Deleted ${deletedCount} sold accounts older than 24h`
    );
    return deletedCount;
  } catch (error) {
    console.error("Error in auto cleanup:", error);
    return 0;
  }
};

// Manual cleanup endpoint
export const runCleanupNow = async (req, res) => {
  try {
    const deletedCount = await autoCleanupSoldAccounts();

    await AdminLog.create({
      adminId: req.admin._id,
      action: "manual_cleanup_accounts",
      details: `Cleanup thủ công: Xóa ${deletedCount} ACC đã bán`,
      metadata: { deletedCount },
    });

    res.status(200).json({
      success: true,
      message: `Đã xóa ${deletedCount} ACC đã bán sau 24h`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error running cleanup:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi chạy cleanup",
    });
  }
};

// Delete account listing with confirmation (removes images, bids, sales)
export const hardDeleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({
        success: false,
        message: "Cần xác nhận trước khi xóa",
      });
    }

    const account = await AccountListing.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ACC",
      });
    }

    // Delete images from server
    const fs = await import("fs").then((m) => m.promises);
    const path = await import("path");

    for (const imageUrl of account.images) {
      try {
        const imagePath = path.join(
          process.cwd(),
          "public",
          imageUrl.replace(/^\//, "")
        );
        await fs.unlink(imagePath);
      } catch (err) {
        console.error(`Failed to delete image: ${imageUrl}`, err);
      }
    }

    // Delete account from database
    await AccountListing.findByIdAndDelete(id);

    await AdminLog.create({
      adminId: req.admin._id,
      action: "hard_delete_account",
      details: `Xóa vĩnh viễn ACC ${account.username}`,
      metadata: { accountId: id, username: account.username },
    });

    res.status(200).json({
      success: true,
      message: "Xóa ACC thành công",
    });
  } catch (error) {
    console.error("Error hard deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa ACC",
    });
  }
};

// Get recent accounts (20 latest)
export const getRecentAccounts = async (req, res) => {
  try {
    const accounts = await AccountListing.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select(
        "username images status saleType accountType price currentBid auctionEndTime soldAt createdAt"
      )
      .populate("uploadedBy", "username")
      .populate("soldTo", "username");

    res.status(200).json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Error fetching recent accounts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách ACC",
    });
  }
};

// Public: find accounts by skin name (also searches ssCards and sssCards)
export const getAccountsBySkin = async (req, res) => {
  try {
    const {
      skin = "",
      game,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    if (!skin) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng cung cấp tham số `skin`" });
    }

    const safe = skin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const filter = { status: "active" };
    if (game) filter.game = game;

    // price filter
    const priceFilter = {};
    if (minPrice !== undefined && minPrice !== null && minPrice !== "")
      priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "")
      priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length > 0) filter.price = priceFilter;

    // search in skins, ssCards, sssCards, and username
    filter.$or = [
      { skins: { $elemMatch: { $regex: regex } } },
      { ssCards: { $elemMatch: { $regex: regex } } },
      { sssCards: { $elemMatch: { $regex: regex } } },
      { username: { $regex: regex } },
      { displayName: { $regex: regex } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const accounts = await AccountListing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "username displayName skins ssCards sssCards level rank price saleType uploadedBy images totalSkins heroes"
      )
      .populate("uploadedBy", "username");

    const total = await AccountListing.countDocuments(filter);

    res
      .status(200)
      .json({
        success: true,
        accounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
  } catch (error) {
    console.error("Error in getAccountsBySkin:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi tìm kiếm theo skin" });
  }
};

// Upload accounts from a file (txt or docx)
export const uploadAccountsFile = async (req, res) => {
  try {
    const { type } = req.body; // 'random' or 'checked-account'
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng gửi file .txt hoặc .docx" });
    }

    // Require admin identity to set uploadedBy (accept req.user from verifyToken)
    const adminId = req.admin?._id || req.user?._id || req.user?.id;
    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: "Yêu cầu quyền admin để upload danh sách ACC",
      });
    }

    // Create a job entry and process the file asynchronously so we can return immediately
    const job = await UploadJob.create({
      adminId,
      filename: file.originalname,
      status: "queued",
      progress: 0,
    });

    // Start background processing (do not await)
    (async () => {
      try {
        await UploadJob.findByIdAndUpdate(job._id, {
          status: "processing",
          progress: 1,
          message: "Đang đọc file",
        });

        const fs = await import("fs").then((m) => m.promises);
        const path = await import("path");

        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".txt") {
          await UploadJob.findByIdAndUpdate(job._id, {
            status: "failed",
            message: "Chỉ hỗ trợ .txt trên server",
          });
          return;
        }

        const content = await fs.readFile(file.path, "utf-8");
        const lines = content
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        const created = [];
        const errors = [];

        // helper to normalize keys (remove diacritics, spaces, lowercase)
        const stripDiacritics = (s = "") =>
          s
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, "")
            .toLowerCase()
            .replace(/\s+/g, "");

        const batchPrice =
          req.body && req.body.price ? parseInt(req.body.price) || 0 : 0;

        // Process lines with incremental progress updates
        for (const [idx, line] of lines.entries()) {
          // update progress every 20 lines
          if (idx % 20 === 0) {
            const pct = Math.floor((idx / Math.max(1, lines.length)) * 100);
            await UploadJob.findByIdAndUpdate(job._id, {
              progress: pct,
              message: `Đang xử lý ${idx}/${lines.length}`,
            });
          }

          const parts = line
            .split("|")
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length < 2) {
            errors.push({ line: idx + 1, reason: "Thiếu account|password" });
            continue;
          }

          const username = parts[0];
          const password = parts[1];

          // Defaults
          let heroes = [];
          let skins = [];
          let ssCards = [];
          let sssCards = [];
          let level = 1;
          let rank = "Unranked";
          let country = "Vietnam";
          let displayName = undefined;
          // additional explicit fields
          let heroesCount = 0;
          let skinsCount = 0;
          let qh = 0;
          let soCount = 0;
          let createdAtOriginal = undefined;
          let lsnap = undefined;
          let lastPasswordChange = undefined;
          let lastPhoneChange = undefined;
          let hasCmnd = false;
          let hasEmail = false;
          let emailStatus = "";
          let hasAuthen = false;
          let hasPhone = false;
          let fbStatus = "";
          let isBanned = false;
          let ssCount = 0;
          let sssCount = 0;
          let animeCount = 0;
          let sssAndAnime = "";
          let accountState = "";
          const otherExtras = [];

          const extras = parts.slice(2);
          for (const extra of extras) {
            const sepIndex = extra.indexOf(":");
            if (sepIndex === -1) {
              otherExtras.push(extra);
              continue;
            }
            const key = extra.slice(0, sepIndex).trim();
            const val = extra.slice(sepIndex + 1).trim();
            const nk = stripDiacritics(key);
            const keyLower = key.toLowerCase();

            if (nk.includes("level")) {
              const parsed = parseInt(val.replace(/[^0-9]/g, ""));
              if (!isNaN(parsed)) level = parsed;
              else otherExtras.push(extra);
            } else if (nk.includes("rank") || nk.includes("hang")) {
              rank = val;
            } else if (
              nk.includes("skin") &&
              (keyLower.includes("skin ss") ||
                nk.includes("skinss") ||
                keyLower.includes("skin_ss"))
            ) {
              const items = val
                .split(/,|;|\|/)
                .map((i) => i.trim())
                .filter(Boolean);
              ssCards = ssCards.concat(items);
            } else if (
              nk.includes("skin") &&
              (keyLower.includes("skin sss") ||
                nk.includes("skinsss") ||
                keyLower.includes("skin_sss"))
            ) {
              const items = val
                .split(/,|;|\|/)
                .map((i) => i.trim())
                .filter(Boolean);
              sssCards = sssCards.concat(items);
            } else if (
              nk.includes("skin") &&
              (keyLower.includes("skin name") ||
                keyLower.includes("skinname") ||
                keyLower.includes("skin ") ||
                nk === "skin")
            ) {
              const items = val
                .split(/,|;|\|/)
                .map((i) => i.trim())
                .filter(Boolean);
              skins = skins.concat(items);
              const parsedCount = parseInt(val.replace(/[^0-9]/g, ""));
              if (!isNaN(parsedCount)) skinsCount = parsedCount;
            } else if (nk.includes("tuong")) {
              const items = val
                .split(/,|;|\|/)
                .map((i) => i.trim())
                .filter(Boolean);
              heroes = heroes.concat(items);
              const parsedCount = parseInt(val.replace(/[^0-9]/g, ""));
              if (!isNaN(parsedCount)) heroesCount = parsedCount;
            } else if (nk === "ss") {
              const items = val
                .split(/,|;|\|/)
                .map((i) => i.trim())
                .filter(Boolean);
              ssCards = ssCards.concat(items);
              const parsed = parseInt(val.replace(/[^0-9]/g, ""));
              if (!isNaN(parsed)) ssCount = parsed;
            } else if (nk === "sss") {
              const items = val
                .split(/,|;|\|/)
                .map((i) => i.trim())
                .filter(Boolean);
              sssCards = sssCards.concat(items);
              const parsed = parseInt(val.replace(/[^0-9]/g, ""));
              if (!isNaN(parsed)) sssCount = parsed;
            } else if (
              nk.includes("name") ||
              nk.includes("ten") ||
              nk.includes("ingame")
            ) {
              displayName = val;
            } else if (nk.includes("country") || nk.includes("vung")) {
              country = val;
            } else if (nk.includes("cmnd")) {
              hasCmnd = /yes|true|có|co/i.test(val);
            } else if (nk.includes("email")) {
              hasEmail = /yes|true|có|co/i.test(val);
              if (/xac/i.test(val) || /verified/i.test(val))
                emailStatus = "verified";
              else emailStatus = val;
            } else if (nk.includes("authen") || nk.includes("2fa")) {
              hasAuthen = /yes|true|có|co/i.test(val);
            } else if (nk.includes("sdt") || nk.includes("phone")) {
              hasPhone = /yes|true|có|co/i.test(val);
            } else if (nk.includes("fb") || keyLower.includes("facebook")) {
              fbStatus = val;
            } else {
              // additional known patterns
              if (nk.includes("qh") || nk.includes("quanhu")) {
                const parsed = parseInt(val.replace(/[^0-9]/g, ""));
                if (!isNaN(parsed)) qh = parsed;
                else otherExtras.push(extra);
              } else if (nk.includes("so") && !nk.includes("skin")) {
                const parsed = parseInt(val.replace(/[^0-9]/g, ""));
                if (!isNaN(parsed)) soCount = parsed;
                else otherExtras.push(extra);
              } else if (
                nk.includes("tao") ||
                nk.includes("taoaccount") ||
                nk.includes("taoaccount")
              ) {
                createdAtOriginal = val;
              } else if (nk.includes("lsnap")) {
                lsnap = val;
              } else if (
                nk.includes("doi pass") ||
                nk.includes("doipass") ||
                nk.includes("doipassgannhat") ||
                nk.includes("doipassgannhat")
              ) {
                lastPasswordChange = val;
              } else if (
                nk.includes("doi sdt") ||
                nk.includes("doisdt") ||
                nk.includes("doisdtgannhat")
              ) {
                lastPhoneChange = val;
              } else if (nk.includes("band")) {
                isBanned =
                  /yes|true|có|co/i.test(val) || /yes/i.test(val)
                    ? /yes|true|có|co/i.test(val)
                    : false;
              } else if (nk.includes("anime")) {
                const parsed = parseInt(val.replace(/[^0-9]/g, ""));
                if (!isNaN(parsed)) animeCount = parsed;
                else sssAndAnime = val;
              } else if (
                nk.includes("sss&anime") ||
                nk.includes("sssandanime") ||
                nk.includes("sssandanime")
              ) {
                sssAndAnime = val;
              } else if (
                nk.includes("tinh trang") ||
                nk.includes("tinhtrang") ||
                nk.includes("tìnhtrạng")
              ) {
                accountState = val;
              } else {
                otherExtras.push(extra);
              }
            }
          }

          const accountData = {
            username,
            password,
            images: [],
            heroes,
            skins,
            ssCards,
            sssCards,
            level,
            rank,
            country,
            // explicit parsed fields (no description aggregation)
            displayName,
            heroesCount,
            skinsCount,
            qh,
            soCount,
            createdAtOriginal,
            lsnap,
            lastPasswordChange,
            lastPhoneChange,
            hasCmnd,
            hasEmail,
            emailStatus,
            hasAuthen,
            hasPhone,
            fbStatus,
            isBanned,
            ssCount,
            sssCount,
            animeCount,
            sssAndAnime,
            accountState,
            saleType: "fixed",
            accountType: type === "random" ? "random" : "checked-account",
            uploadedBy: adminId,
          };

          if (batchPrice && batchPrice > 0) accountData.price = batchPrice;

          try {
            const acc = await AccountListing.create(accountData);
            created.push({ id: acc._id, username: acc.username });
          } catch (err) {
            errors.push({ line: idx + 1, reason: err.message });
          }
        }

        // final update
        await UploadJob.findByIdAndUpdate(job._id, {
          status: "done",
          progress: 100,
          message: "Đã xử lý xong",
          result: { createdCount: created.length, errorsCount: errors.length },
        });

        // Log admin action
        if (adminId) {
          await AdminLog.create({
            adminId,
            action: "bulk_upload_accounts",
            details: `Upload ${created.length} accounts from file ${file.originalname}`,
            metadata: {
              createdCount: created.length,
              errorsCount: errors.length,
            },
          });
        }
      } catch (bgErr) {
        console.error("Background upload processing failed:", bgErr);
        await UploadJob.findByIdAndUpdate(job._id, {
          status: "failed",
          message: String(bgErr),
        });
      }
    })();

    // immediate response with job id so frontend can poll
    res.status(202).json({ success: true, jobId: job._id });
  } catch (error) {
    console.error("Error uploading accounts file:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xử lý file upload" });
  }
};

// Get upload job status
export const getUploadJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await UploadJob.findById(id);
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy job" });
    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error("Error fetching upload job:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy trạng thái job" });
  }
};
