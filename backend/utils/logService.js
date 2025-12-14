import Log from "../models/Log.js";
import jwt from "jsonwebtoken";
import { extractToken } from "../middleware/auth.js";
import { config } from "../config/env.js";

const resolveClientIp = (r) => {
  const xf = r.headers["x-forwarded-for"] || r.headers["X-Forwarded-For"];
  if (xf) {
    const s = Array.isArray(xf) ? xf[0] : String(xf);
    return s.split(",")[0].trim();
  }
  return r.ip || r.connection?.remoteAddress || r.socket?.remoteAddress || null;
};

// Mask/anonymize IP for privacy before storing in logs
const maskIp = (ip) => {
  if (!ip) return ip;
  // if explicitly disabled via env, return raw
  try {
    const disabled = String(process.env.LOG_MASK_IP || "true").toLowerCase();
    if (disabled === "false" || disabled === "0") return ip;
  } catch (e) {}

  // IPv6 loopback -> show 'localhost'
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return "localhost";

  // IPv4 mapped in IPv6 like ::ffff:127.0.0.1
  const v4mapped = ip.includes("::ffff:") ? ip.split("::ffff:").pop() : null;
  if (v4mapped) ip = v4mapped;

  if (ip.indexOf(":") !== -1) {
    // IPv6: keep first 2 hextets, mask the rest
    const parts = ip.split(":");
    if (parts.length <= 2) return ip;
    const visible = parts.slice(0, 2).join(":");
    return `${visible}:...`;
  }

  if (ip.indexOf(".") !== -1) {
    // IPv4: mask last octet
    const parts = ip.split(".");
    if (parts.length === 4) {
      parts[3] = "***";
      return parts.join(".");
    }
  }

  return ip;
};

export const createUserLog = async (req, opts = {}) => {
  const {
    level = "info",
    message = "",
    source = "backend",
    page,
    meta = {},
    userId: userIdOverride,
    userEmail: userEmailOverride,
    userName: userNameOverride,
  } = opts;

  let userId = userIdOverride || req.user?.id || null;
  let userEmail = userEmailOverride || req.user?.email || null;
  let userName =
    userNameOverride || req.user?.username || req.user?.userName || null;

  // Try decode token if no req.user
  if (!userId || !userEmail) {
    try {
      const { token } = extractToken(req);
      if (token) {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded) {
          userId = userId || decoded.id || decoded._id || null;
          userEmail = userEmail || decoded.email || null;
          userName = userName || decoded.username || null;
        }
      }
    } catch (e) {
      // ignore decode errors
    }
  }

  // Ensure meta object and attach ip/device
  const newMeta = typeof meta === "object" && meta ? { ...meta } : {};
  if (!newMeta.ip) newMeta.ip = maskIp(resolveClientIp(req));
  if (!newMeta.deviceInfo) newMeta.deviceInfo = req.headers["user-agent"] || "";

  const log = await Log.create({
    level,
    message,
    source,
    page,
    userId,
    userEmail,
    userName,
    meta: newMeta,
  });

  return log;
};

export default createUserLog;
