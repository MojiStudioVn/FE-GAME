import User from "../models/User.js";
import Log from "../models/Log.js";
import bcrypt from "bcryptjs";

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      role = "",
    } = req.query;

    const query = {};

    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Calculate skip
    const skip = (Number(page) - 1) * Number(limit);

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    // Get stats
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalCoins: { $sum: "$coins" },
        },
      },
    ]);

    const roleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: users,
      stats: {
        total: stats[0]?.total || 0,
        totalCoins: stats[0]?.totalCoins || 0,
        byRole: roleStats,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách users",
      error: error.message,
    });
  }
};

// @desc    Adjust user coins
// @route   POST /api/admin/users/:userId/adjust-coins
// @access  Private/Admin
export const adjustUserCoins = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount === 0) {
      return res.status(400).json({
        success: false,
        message: "Số xu phải khác 0",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // Calculate new coins
    const newCoins = user.coins + amount;
    if (newCoins < 0) {
      return res.status(400).json({
        success: false,
        message: "Số xu không đủ để trừ",
      });
    }

    // Update user coins
    user.coins = newCoins;
    await user.save();

    // Create log
    await Log.create({
      level: "info",
      message: `Admin điều chỉnh xu cho user ${user.username}: ${
        amount > 0 ? "+" : ""
      }${amount} xu`,
      source: "admin",
      userId: user._id,
      userEmail: user.email,
      meta: {
        type: "admin_adjust",
        coins: amount,
        reason: reason || "Admin điều chỉnh thủ công",
        adminId: req.user.id,
        adminEmail: req.user.email,
        oldCoins: user.coins - amount,
        newCoins: user.coins,
      },
    });

    res.status(200).json({
      success: true,
      message: `Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(
        amount
      )} xu cho user ${user.username}`,
      data: {
        userId: user._id,
        username: user.username,
        oldCoins: user.coins - amount,
        newCoins: user.coins,
        adjustment: amount,
      },
    });
  } catch (error) {
    console.error("❌ Error adjusting coins:", error);
    res.status(500).json({
      success: false,
      message: "Không thể điều chỉnh xu",
      error: error.message,
    });
  }
};

// @desc    Search user by username or ID
// @route   GET /api/admin/users/search
// @access  Private/Admin
export const searchUser = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập từ khóa tìm kiếm",
      });
    }

    // Search by username, email, or ID
    const query = {
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    };

    // If q is a valid ObjectId, also search by _id
    if (q.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: q });
    }

    const users = await User.find(query).select("-password").limit(10).lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("❌ Error searching user:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tìm kiếm user",
      error: error.message,
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:userId/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "banned", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // Create log
    await Log.create({
      level: "info",
      message: `Admin thay đổi trạng thái user ${user.username} thành ${status}`,
      source: "admin",
      userId: user._id,
      userEmail: user.email,
      meta: {
        type: "status_change",
        newStatus: status,
        adminId: req.user.id,
        adminEmail: req.user.email,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái",
      error: error.message,
    });
  }
};

// @desc    Update user information
// @route   PUT /api/admin/users/:userId
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const oldData = {
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    // Create log
    await Log.create({
      action: "admin_update_user",
      message: `Admin cập nhật user ${userId}`,
      source: "backend",
      userId: req.user.id,
      userName: req.user.username,
      userEmail: req.user.email,
      meta: {
        type: "user_update",
        targetUserId: userId,
        oldData,
        newData: { username, email, role },
      },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông tin",
      error: error.message,
    });
  }
};

// @desc    Reset user password
// @route   POST /api/admin/users/:userId/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu mới",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    // Create log
    await Log.create({
      action: "admin_reset_password",
      message: `Admin đặt lại mật khẩu cho user ${user.username}`,
      source: "backend",
      userId: req.user.id,
      userName: req.user.username,
      userEmail: req.user.email,
      meta: {
        type: "password_reset",
        targetUserId: userId,
        targetUsername: user.username,
      },
    });

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Không thể đặt lại mật khẩu",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa tài khoản admin",
      });
    }

    // Create log before deleting
    await Log.create({
      action: "admin_delete_user",
      message: `Admin xóa user ${user.username} (${userId})`,
      source: "backend",
      userId: req.user.id,
      userName: req.user.username,
      userEmail: req.user.email,
      meta: {
        type: "user_delete",
        deletedUserId: userId,
        deletedUsername: user.username,
        deletedEmail: user.email,
      },
    });

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa người dùng",
      error: error.message,
    });
  }
};
