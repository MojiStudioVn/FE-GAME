import {
  generateCSRFToken,
  validateCSRFToken,
  getClientIP,
  hashIP,
} from "../utils/security.js";
import { config } from "../config/env.js";

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing requests
 */
export const csrfProtection = (req, res, next) => {
  // Generate token for GET requests
  if (req.method === "GET") {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCSRFToken();
    }
    res.locals.csrfToken = req.session.csrfToken;
    return next();
  }

  // Validate token for POST, PUT, DELETE, PATCH
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const token = req.headers["x-csrf-token"] || req.body._csrf;

    if (!validateCSRFToken(token, req.session.csrfToken)) {
      return res.status(403).json({
        success: false,
        message: "Invalid CSRF token",
      });
    }
  }

  next();
};

/**
 * IP Tracking Middleware
 * Logs and tracks client IP addresses
 */
export const ipTracking = (req, res, next) => {
  const clientIP = getClientIP(req);
  const hashedIP = hashIP(clientIP);

  req.clientIP = clientIP;
  req.hashedIP = hashedIP;

  // Store in session for tracking
  if (req.session) {
    req.session.ip = hashedIP;
    req.session.lastAccess = new Date();
  }

  next();
};

/**
 * Admin Session Configuration
 * Separate session for admin users
 */
export const adminSessionConfig = {
  name: "ADMINSESSID",
  secret: process.env.ADMIN_SESSION_SECRET || "admin-secret-key-change-this",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 86400000, // 24 hours
    sameSite: "strict",
  },
};

/**
 * User Session Configuration
 * Separate session for regular users
 */
export const userSessionConfig = {
  name: "USERSESSID",
  secret: process.env.SESSION_SECRET || "user-secret-key-change-this",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 604800000, // 7 days
    sameSite: "lax",
  },
};

/**
 * HTTPS Redirect Middleware
 * Redirects HTTP to HTTPS in production
 */
export const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    // If proxy set X-Forwarded-Proto to https, treat as secure
    const forwardedProto =
      (req.get && req.get("X-Forwarded-Proto")) ||
      req.headers["x-forwarded-proto"];
    if (forwardedProto && forwardedProto.toLowerCase() === "https") {
      return next();
    }

    // Prefer configured CLIENT_URL to avoid redirecting to internal host (127.0.0.1)
    // Parse CLIENT_URL safely: if it's a full URL, use its host; otherwise
    // strip any leading protocol-like sequences and trailing path.
    let hostForRedirect = req.headers.host || "localhost";
    if (config && config.CLIENT_URL) {
      const raw = String(config.CLIENT_URL).trim();
      try {
        // Try parsing as a full URL first
        const parsed = new URL(raw);
        if (parsed.host) hostForRedirect = parsed.host;
      } catch (e) {
        // Not a full URL, clean it: remove repeated protocols and any path
        let cleaned = raw.replace(/^(?:https?:\/\/)*/i, "");
        const slashIdx = cleaned.indexOf("/");
        if (slashIdx !== -1) cleaned = cleaned.slice(0, slashIdx);
        if (cleaned) hostForRedirect = cleaned;
      }
    }

    return res.redirect(301, `https://${hostForRedirect}${req.url}`);
  }
  next();
};

/**
 * Security Headers Middleware
 * Sets various security headers including CSP
 */
export const securityHeaders = (req, res, next) => {
  // Get CSP mode from system settings (default: strict)
  const cspMode = process.env.CSP_MODE || "strict";

  // CSP configurations
  const cspPolicies = {
    strict: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    },
    moderate: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'", "data:"],
      "connect-src": ["'self'", "https://api.mojistudio.vn"],
      "frame-ancestors": ["'self'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    },
    relaxed: {
      "default-src": ["'self'", "*"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["*", "data:", "blob:"],
      "font-src": ["*", "data:"],
      "connect-src": ["*"],
    },
  };

  const selectedPolicy = cspPolicies[cspMode] || cspPolicies.strict;

  // Build CSP header
  const cspHeader = Object.entries(selectedPolicy)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");

  // Set security headers
  res.setHeader("Content-Security-Policy", cspHeader);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // HSTS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
};

/**
 * Rate Limiting Store (in-memory)
 * For production, use Redis
 */
const rateLimitStore = new Map();

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks
 */
export const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || 900000; // 15 minutes
  const max = options.max || 100;
  const message =
    options.message || "Too many requests, please try again later";

  return (req, res, next) => {
    const key = req.hashedIP || getClientIP(req);
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    record.count++;
    next();
  };
};

export default {
  csrfProtection,
  ipTracking,
  adminSessionConfig,
  userSessionConfig,
  httpsRedirect,
  securityHeaders,
  rateLimit,
};
