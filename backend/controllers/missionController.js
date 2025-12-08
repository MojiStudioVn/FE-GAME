import Mission from "../models/Mission.js";
import UserMission from "../models/UserMission.js";
import User from "../models/User.js";

// GET /api/admin/missions
export const getMissions = async (req, res) => {
  try {
    const missions = await Mission.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, missions });
  } catch (err) {
    console.error("Error fetching missions:", err);
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
      maxUses,
      expireAt,
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
      maxUses: Number(maxUses) || 1,
      expireAt: expireAt ? new Date(expireAt) : null,
      singleUsePerUser: singleUsePerUser !== undefined ? !!singleUsePerUser : true,
      createdBy: req.admin?._id || req.user?._id || null,
    });

    res.status(201).json({ success: true, mission });
  } catch (err) {
    console.error("Error creating mission:", err);
    res.status(500).json({ success: false, message: "Lỗi khi tạo nhiệm vụ" });
  }
};

// GET /api/missions/:id (public)
export const getMissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const mission = await Mission.findById(id).lean();
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });

    // Do not expose code to public if it's secret
    const safe = { ...mission };
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
    if (!user) return res.status(401).json({ success: false, message: "Vui lòng đăng nhập" });

    const mission = await Mission.findById(id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });
    if (mission.status !== "active") return res.status(400).json({ success: false, message: "Mission không hoạt động" });
    if (mission.expireAt && new Date() > new Date(mission.expireAt)) return res.status(400).json({ success: false, message: "Mission đã hết hạn" });
    if (mission.uses >= (mission.maxUses || 1)) return res.status(400).json({ success: false, message: "Mission đã đủ lượt" });

    if (mission.singleUsePerUser) {
      const existing = await UserMission.findOne({ mission: mission._id, user: user._id });
      if (existing) return res.status(400).json({ success: false, message: "Bạn đã nhận thưởng nhiệm vụ này" });
    }

    // Validate code if provided on mission
    if (mission.code && mission.code !== code) {
      return res.status(400).json({ success: false, message: "Mã xác nhận không hợp lệ" });
    }

    // All good: increment user coins and record claim atomically
    const updatedUser = await User.findByIdAndUpdate(user._id, { $inc: { coins: mission.reward } }, { new: true });

    // create UserMission record
    await UserMission.create({
      user: user._id,
      mission: mission._id,
      rewardGiven: mission.reward,
      ip: req.ip,
      deviceInfo: req.headers["user-agent"] || "",
    });

    // increment mission uses
    mission.uses = (mission.uses || 0) + 1;
    await mission.save();

    res.status(200).json({ success: true, message: "Nhận thưởng thành công", coins: updatedUser.coins });
  } catch (err) {
    console.error("Error verifying mission:", err);
    res.status(500).json({ success: false, message: "Lỗi khi xác thực nhiệm vụ" });
  }
};
