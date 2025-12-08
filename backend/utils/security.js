import crypto from "crypto";

/**
 * Security Utilities
 * Provides encryption, CSRF tokens, XSS filtering, and other security features
 */

// AES-256-GCM Encryption Key (should be in .env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text with IV and auth tag
 */
export const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    throw new Error("Encryption failed");
  }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted text with IV and auth tag
 * @returns {string} Decrypted text
 */
export const decrypt = (encryptedData) => {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed");
  }
};

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Validate CSRF token
 * @param {string} token - Token from request
 * @param {string} sessionToken - Token from session
 * @returns {boolean} Valid or not
 */
export const validateCSRFToken = (token, sessionToken) => {
  if (!token || !sessionToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return sanitizeInput(obj);
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }

  return sanitized;
};

/**
 * Hash IP address for privacy
 * @param {string} ip - IP address
 * @returns {string} Hashed IP
 */
export const hashIP = (ip) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};

/**
 * Get client IP from request
 * @param {object} req - Express request
 * @returns {string} Client IP
 */
export const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

/**
 * Validate file upload
 * @param {object} file - Multer file object
 * @param {array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Max size in bytes
 * @returns {object} Validation result
 */
export const validateFileUpload = (file, allowedTypes, maxSize) => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: "Invalid file type" };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file extension matches MIME type
  const ext = file.originalname.split(".").pop().toLowerCase();
  const mimeExt = file.mimetype.split("/").pop();

  if (ext !== mimeExt && !["jpeg", "jpg"].includes(ext)) {
    return { valid: false, error: "File extension does not match type" };
  }

  return { valid: true };
};

export default {
  encrypt,
  decrypt,
  generateCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  sanitizeObject,
  hashIP,
  getClientIP,
  validateFileUpload,
};
