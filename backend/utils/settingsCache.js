import SystemSettings from "../models/SystemSettings.js";

/**
 * Settings Cache
 * Caches system settings to avoid database queries on every request
 */
class SettingsCache {
  constructor() {
    this.cache = null;
    this.lastUpdate = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get settings from cache or database
   */
  async getSettings() {
    const now = Date.now();

    // Return cached settings if still valid
    if (
      this.cache &&
      this.lastUpdate &&
      now - this.lastUpdate < this.cacheDuration
    ) {
      return this.cache;
    }

    try {
      // Fetch from database
      let settings = await SystemSettings.findOne();

      // Create default settings if not exists
      if (!settings) {
        settings = await SystemSettings.create({});
      }

      // Update cache
      this.cache = settings;
      this.lastUpdate = now;

      return settings;
    } catch (error) {
      console.error("Error fetching system settings:", error);

      // Return cache or defaults on error
      if (this.cache) {
        return this.cache;
      }

      // Return default values
      return {
        cspMode: process.env.CSP_MODE || "moderate",
        rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
        httpsEnabled: process.env.NODE_ENV === "production",
        sessionMaxAge: 604800000,
        adminSessionMaxAge: 86400000,
        maxFileSize: 10485760,
        maxFiles: 10,
        allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      };
    }
  }

  /**
   * Get specific setting value
   */
  async get(key) {
    const settings = await this.getSettings();
    return settings[key];
  }

  /**
   * Clear cache (call after updating settings)
   */
  clearCache() {
    this.cache = null;
    this.lastUpdate = null;
  }

  /**
   * Update cache with new settings
   */
  updateCache(settings) {
    this.cache = settings;
    this.lastUpdate = Date.now();
  }
}

// Export singleton instance
const settingsCache = new SettingsCache();
export default settingsCache;
