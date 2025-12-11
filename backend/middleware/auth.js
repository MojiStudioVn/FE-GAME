import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

// Helper: extract token and diagnostic info from request
export const extractToken = (req) => {
  let token = null;
  const diagnostic = {
    hasAuthHeader: false,
    cookieNames: [],
    hasSessionToken: false,
  };

  // Authorization: Bearer <token>
  if (req.headers.authorization) {
    diagnostic.hasAuthHeader = true;
    const parts = String(req.headers.authorization).split(" ");
    if (parts.length === 2) token = parts[1];
  }

  // parse cookie names (do not expose values)
  if (req.headers.cookie) {
    const raw = req.headers.cookie.split(";").map((c) => c.trim());
    for (const pair of raw) {
      const [k] = pair.split("=");
      if (k) diagnostic.cookieNames.push(k);
    }

    if (!token) {
      for (const pair of raw) {
        const [k, v] = pair.split("=");
        if (!k || !v) continue;
        if (k === "token" || k === "accessToken" || k === "auth_token") {
          token = decodeURIComponent(v);
          break;
        }
      }
    }
  }

  // session fallback
  if (!token && req.session && req.session.token) {
    diagnostic.hasSessionToken = true;
    token = req.session.token;
  }

  return { token, diagnostic };
};

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const { token, diagnostic } = extractToken(req);

  // Debug logging in non-production only: log presence of auth methods, not token values
  if (config.NODE_ENV !== "production") {
    console.info("[auth] verifyToken request:", {
      method: req.method,
      path: req.originalUrl || req.url,
      hasAuthHeader: diagnostic.hasAuthHeader,
      cookieNames: diagnostic.cookieNames,
      hasSessionToken: diagnostic.hasSessionToken,
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy token, truy cập bị từ chối",
      debug: config.NODE_ENV !== "production" ? diagnostic : undefined,
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    // For legacy controllers expecting req.admin, set it when role === 'admin'
    if (decoded && decoded.role === "admin") {
      req.admin = decoded;
    }
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
