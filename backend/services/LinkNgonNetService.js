import axios from "axios";

/**
 * LinkNgon.net API Service
 * Documentation: linkngon.net API
 *
 * Features:
 * - Shorten URL
 * - Supports JSON and TEXT format
 * - Supports custom alias
 */

class LinkNgonNetService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://linkngon.net";
  }

  /**
   * Shorten a URL
   * @param {string} url - The URL to shorten
   * @param {object} options - Optional parameters
   * @param {string} options.alias - Custom alias for the shortened URL
   * @returns {Promise<object>} Shortened URL response
   */
  async shortenUrl(url, options = {}) {
    try {
      const { alias } = options;

      const params = new URLSearchParams({
        api: this.apiKey,
        url: url,
      });

      if (alias) params.append("alias", alias);

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
      console.error("LinkNgon.net shorten error:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
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
      console.error("LinkNgon.net test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Không thể kết nối đến LinkNgon.net API",
      };
    }
  }
}

export default LinkNgonNetService;
