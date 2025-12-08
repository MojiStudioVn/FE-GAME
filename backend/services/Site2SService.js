import axios from "axios";

/**
 * Site2S API Service
 * Documentation: site2s.com API
 *
 * Features:
 * - Shorten URL
 * - Get remaining views
 * - Check link views
 */

class Site2SService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://site2s.com";
  }

  /**
   * Shorten a URL
   * @param {string} url - The URL to shorten
   * @param {object} options - Optional parameters
   * @param {string} options.alias - Custom alias for the shortened URL
   * @param {number} options.type - 0 = no ads, 1 = with interstitial ads
   * @returns {Promise<object>} Shortened URL response
   */
  async shortenUrl(url, options = {}) {
    try {
      const { alias, type } = options;

      const params = new URLSearchParams({
        api: this.apiKey,
        url: url,
        format: "json",
      });

      if (alias) params.append("alias", alias);
      if (type !== undefined) params.append("type", type);

      const apiUrl = `${this.baseUrl}/api?${params.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data.status === "error") {
        throw new Error(response.data.message || "Failed to shorten URL");
      }

      return {
        success: true,
        shortenedUrl: response.data.shortenedUrl,
        originalUrl: url,
      };
    } catch (error) {
      console.error("Site2S shorten error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get remaining views for the account
   * @returns {Promise<object>} Remaining views data
   */
  async getRemainingViews() {
    try {
      const response = await axios.get(`${this.baseUrl}/apicodedata`);

      if (response.data.status !== 200) {
        throw new Error("Failed to get remaining views");
      }

      return {
        success: true,
        remainingViews: response.data.remaining_views,
        remainingPercentage: response.data.remaining_percentage,
      };
    } catch (error) {
      console.error("Site2S remaining views error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check views for a specific link
   * @param {string} slug - The slug of the shortened link
   * @returns {Promise<object>} Link views data
   */
  async checkLinkViews(slug) {
    try {
      const response = await axios.get(`${this.baseUrl}/${slug}/info/json`);

      if (response.data.status !== 200) {
        throw new Error("Failed to get link views");
      }

      return {
        success: true,
        slug: response.data.slug,
        views: response.data.view,
      };
    } catch (error) {
      console.error("Site2S link views error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test API connection by shortening a test URL
   * @returns {Promise<object>} Test result with success status and details
   */
  async testConnection() {
    try {
      // Test by shortening a simple URL
      const testUrl = "https://mojistudio.vn";
      const params = new URLSearchParams({
        api: this.apiKey,
        url: testUrl,
      });

      const apiUrl = `${this.baseUrl}/api?${params.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data.status === "success") {
        return {
          success: true,
          message: "Kết nối thành công! API Key hợp lệ.",
          shortenedUrl: response.data.shortenedUrl,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "API Key không hợp lệ",
        };
      }
    } catch (error) {
      console.error("Site2S test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Không thể kết nối đến Site2S API",
      };
    }
  }
}

export default Site2SService;
