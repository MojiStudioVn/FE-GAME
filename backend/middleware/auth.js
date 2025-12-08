import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy token, truy cập bị từ chối",
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Truy cập bị từ chối. Chỉ admin mới có quyền này",
    });
  }
};

// Check if user is owner or admin
export const isOwnerOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (
    req.user &&
    (req.user.id === resourceUserId || req.user.role === "admin")
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message:
        "Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này",
    });
  }
};
