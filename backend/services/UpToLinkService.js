import axios from "axios";

/**
 * UpToLink API Service
 * Documentation: uptolink.one API
 *
 * Features:
 * - Shorten URL
 * - Supports JSON and TEXT format
 * - Supports custom alias
 * - Supports campaign types (0: no ads, 1-4: different ad campaigns)
 */

class UpToLinkService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://uptolink.one";
  }

  /**
   * Shorten a URL
   * @param {string} url - The URL to shorten
   * @param {object} options - Optional parameters
   * @param {string} options.alias - Custom alias for the shortened URL
   * @param {number} options.type - Campaign type (0: no ads, 1: social, 2: google, 3: google 3-step, 4: google 2-step)
   * @returns {Promise<object>} Shortened URL response
   */
  async shortenUrl(url, options = {}) {
    try {
      const { alias, type } = options;

      const params = new URLSearchParams({
        api: this.apiKey,
        url: url,
      });

      if (alias) params.append("alias", alias);
      if (type !== undefined) params.append("type", type);

      const apiUrl = `${this.baseUrl}/api?${params.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data.status === "success") {
        return {
          success: true,
          shortenedUrl: response.data.shortenedUrl,
          originalUrl: url,
        };
      } else {
        throw new Error(response.data.message || "Failed to shorten URL");
      }
    } catch (error) {
      console.error("UpToLink shorten error:", error.message);
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message;
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Test API connection by shortening a test URL
   * @returns {Promise<object>} Test result with success status and details
   */
  async testConnection() {
    try {
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
          message: "Kết nối thành công! API Token hợp lệ.",
          shortenedUrl: response.data.shortenedUrl,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "API Token không hợp lệ",
        };
      }
    } catch (error) {
      console.error("UpToLink test connection error:", error.message);
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "Không thể kết nối đến UpToLink API";
      return {
        success: false,
        message: errorMsg,
      };
    }
  }
}

export default UpToLinkService;
