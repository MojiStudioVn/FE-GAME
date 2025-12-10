import Mission from "../models/Mission.js";
import UserMission from "../models/UserMission.js";
import User from "../models/User.js";
import { createShortLink } from "./linkShortcutController.js";

// GET /api/admin/missions
export const getMissions = async (req, res) => {
  try {
    const missions = await Mission.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, missions });
  } catch (err) {
    console.error("Error fetching missions:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhiệm vụ",
      error: err?.message || String(err),
    });
  }
};

// GET /api/missions  (public list)
export const listPublicMissions = async (req, res) => {
  try {
    // Return active missions sorted by reward desc then createdAt
    const missions = await Mission.find({ status: "active" })
      .sort({ reward: -1, createdAt: -1 })
      .lean();

    // remove any sensitive fields, but expose whether a code is required
    const safe = missions.map((m) => {
      const { code, ...rest } = m;
      rest.requiresCode = !!code;
      return rest;
    });

    res.status(200).json({ success: true, missions: safe });
  } catch (err) {
    console.error("Error fetching public missions:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách nhiệm vụ" });
  }
};

// POST /api/admin/missions
export const createMission = async (req, res) => {
  try {
    const {
      name,
      description,
      provider,
      url,
      shortcut,
      reward,
      code,
      singleUsePerUser,
      alias,
    } = req.body;
    if (!name || !url)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tên hoặc url" });

    const mission = await Mission.create({
      name,
      description: description || "",
      provider: provider || "",
      url,
      shortcut: shortcut || "",
      alias: alias || "",
      code: code || "",
      reward: Number(reward) || 0,
      // no maxUses or expireAt per updated validation rules
      singleUsePerUser:
        singleUsePerUser !== undefined ? !!singleUsePerUser : true,
      createdBy: req.admin?._id || req.user?._id || null,
    });

    // If provider provided, attempt to auto-shorten and update mission
    if (mission.provider) {
      try {
        const shortenResult = await createShortLink(
          mission.provider,
          mission.url,
          mission.alias || undefined
        );
        if (shortenResult && shortenResult.shortcut) {
          mission.shortcut = shortenResult.shortcut;
          mission.alias = shortenResult.alias || mission.alias;
          mission.status = "active";
          await mission.save();
        }
      } catch (err) {
        console.error("Auto-shorten failed for mission:", err?.message || err);
        // keep mission in draft state and return diagnostic to admin
        return res.status(201).json({
          success: true,
          mission,
          shortenError: err.message || "Auto-shorten failed",
        });
      }
    }

    res.status(201).json({ success: true, mission });
  } catch (err) {
    console.error("Error creating mission:", err);
    res.status(500).json({ success: false, message: "Lỗi khi tạo nhiệm vụ" });
  }
};

// GET /api/missions/:id (public)
export const getMissionById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = typeof rawId === "string" ? decodeURIComponent(rawId) : rawId;

    // Try direct ObjectId lookup first
    let mission = null;
    try {
      mission = await Mission.findById(id).lean();
    } catch (e) {
      // ignore cast errors
      mission = null;
    }

    // If not found by ObjectId, try alternative lookups:
    if (!mission) {
      // 1) alias exact match
      mission = await Mission.findOne({ alias: id }).lean();
    }

    if (!mission) {
      // 2) shortcut contains the id (short link path or full url)
      try {
        mission = await Mission.findOne({
          shortcut: { $regex: id, $options: "i" },
        }).lean();
      } catch (e) {
        mission = null;
      }
    }

    if (!mission) {
      // 3) url ends with the id (e.g., long url /mission-landing/{path})
      try {
        mission = await Mission.findOne({
          url: { $regex: `${id}$`, $options: "i" },
        }).lean();
      } catch (e) {
        mission = null;
      }
    }

    if (!mission)
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });

    // Indicate if a code is required and (optionally) provide a public code
    const safe = { ...mission };
    safe.requiresCode = !!safe.code;
    // expose the code specifically for the landing page as `publicCode` (null if none)
    safe.publicCode = safe.code || null;
    if (safe.code) delete safe.code;

    res.status(200).json({ success: true, mission: safe });
  } catch (err) {
    console.error("Error fetching mission:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy nhiệm vụ" });
  }
};

// POST /api/missions/:id/verify (authenticated)
export const verifyMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập" });

    const mission = await Mission.findById(id);
    if (!mission)
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });
    if (mission.status !== "active")
      return res
        .status(400)
        .json({ success: false, message: "Mission không hoạt động" });
    // No expiry check and no max-uses check per mission policy

    const userId = user.id || user._id;
    if (mission.singleUsePerUser) {
      const existing = await UserMission.findOne({
        mission: mission._id,
        user: userId,
      });
      if (existing)
        return res
          .status(400)
          .json({ success: false, message: "Bạn đã nhận thưởng nhiệm vụ này" });
    }

    // Validate code if provided on mission
    if (mission.code && mission.code !== code) {
      return res
        .status(400)
        .json({ success: false, message: "Mã xác nhận không hợp lệ" });
    }

    // All good: increment user coins and record claim atomically
    // Resolve client IP (honor X-Forwarded-For if present) so stored IP matches client-visible IP
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

    // Try to find an existing started claim by this user/ip for this mission today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let updatedUser = null;
    const started = await UserMission.findOne({
      mission: mission._id,
      ip: clientIp,
      status: "started",
      createdAt: { $gte: todayStart },
    });

    if (started) {
      // award coins and mark started as completed
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: mission.reward } },
        { new: true }
      );

      started.user = userId;
      started.rewardGiven = mission.reward;
      started.status = "completed";
      started.claimedAt = new Date();
      await started.save();
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { coins: mission.reward } },
        { new: true }
      );

      // create UserMission record
      await UserMission.create({
        user: userId,
        mission: mission._id,
        rewardGiven: mission.reward,
        ip: clientIp,
        deviceInfo: req.headers["user-agent"] || "",
        status: "completed",
      });
    }

    // increment mission uses
    mission.uses = (mission.uses || 0) + 1;
    await mission.save();

    res.status(200).json({
      success: true,
      message: "Nhận thưởng thành công",
      coins: updatedUser.coins,
    });
  } catch (err) {
    console.error("Error verifying mission:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xác thực nhiệm vụ" });
  }
};

// PUT /api/admin/missions/:id
export const updateMission = async (req, res) => {
  try {
    const { id } = req.params;
    const up = req.body || {};
    // Only allow specific fields to be updated by admin
    const allowed = [
      "name",
      "description",
      "provider",
      "url",
      "shortcut",
      "reward",
      "code",
      "singleUsePerUser",
      "status",
      "alias",
    ];
    const patch = {};
    allowed.forEach((k) => {
      if (up[k] !== undefined) patch[k] = up[k];
    });

    if (patch.reward !== undefined) patch.reward = Number(patch.reward) || 0;

    const mission = await Mission.findByIdAndUpdate(id, patch, { new: true });
    if (!mission)
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });

    res.status(200).json({ success: true, mission });
  } catch (err) {
    console.error("Error updating mission:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật nhiệm vụ" });
  }
};

// DELETE /api/admin/missions/:id
export const deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    const mission = await Mission.findById(id);
    if (!mission)
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });

    // remove related user-mission records
    await UserMission.deleteMany({ mission: mission._id });
    await mission.remove();

    res.status(200).json({ success: true, message: "Mission deleted" });
  } catch (err) {
    console.error("Error deleting mission:", err);
    res.status(500).json({ success: false, message: "Lỗi khi xóa nhiệm vụ" });
  }
};

// POST /api/missions/:id/start (authenticated)
export const startMission = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập" });
    const userId = user.id || user._id;

    const mission = await Mission.findById(id);
    if (!mission)
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });
    if (mission.status !== "active")
      return res
        .status(400)
        .json({ success: false, message: "Mission không hoạt động" });
    // No expiry check and no max-uses check per mission policy

    // Only one active claim per IP per mission until reset (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Resolve client IP (honor X-Forwarded-For if present) so stored IP matches client-visible IP
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

    // If a completed claim exists for this IP today, block it.
    const completed = await UserMission.findOne({
      mission: mission._id,
      ip: clientIp,
      status: "completed",
      createdAt: { $gte: todayStart },
    });
    if (completed) {
      return res.status(409).json({
        success: false,
        message: "IP này đã được sử dụng cho nhiệm vụ này hôm nay",
      });
    }

    // If a started claim already exists for this IP today, do NOT error — allow retrying.
    const startedExisting = await UserMission.findOne({
      mission: mission._id,
      ip: clientIp,
      status: "started",
      createdAt: { $gte: todayStart },
    });

    if (!startedExisting) {
      // create a started claim
      await UserMission.create({
        user: userId,
        mission: mission._id,
        rewardGiven: 0,
        ip: clientIp,
        deviceInfo: req.headers["user-agent"] || "",
        status: "started",
      });
    }

    // Always respond with success so UI can proceed; if a started record existed we still allow retry
    res.status(200).json({
      success: true,
      message: "Bắt đầu nhiệm vụ, IP đã được ghi nhận",
    });
  } catch (err) {
    console.error("Error starting mission:", err?.stack || err);
    // Return more detailed message for debugging (will include err.message if available)
    const msg = err?.message || "Lỗi khi bắt đầu nhiệm vụ";
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/missions/status (authenticated) - return today's started/completed status per mission for the current user
export const getUserMissionStatuses = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập" });
    const userId = user.id || user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Find user mission records for today for this user
    const records = await UserMission.find({
      user: userId,
      createdAt: { $gte: todayStart },
    }).lean();

    // Map missionId -> status
    const map = {};
    for (const r of records) {
      map[String(r.mission)] = r.status || "completed";
    }

    res.status(200).json({ success: true, statuses: map });
  } catch (err) {
    console.error("Error fetching user mission statuses:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy trạng thái nhiệm vụ" });
  }
};
