import axios from "axios";

/**
 * LinkTop API Service
 * Documentation: linktop.one API
 *
 * Features:
 * - Shorten URL
 */

class LinkTopService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://linktop.one";
  }

  /**
   * Shorten a URL
   * @param {string} url - The URL to shorten
   * @param {object} options - Optional parameters
   * @returns {Promise<object>} Shortened URL response
   */
  async shortenUrl(url, options = {}) {
    try {
      const params = new URLSearchParams({
        api: this.apiKey,
        url: url,
      });

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
      console.error("LinkTop shorten error:", error.message);
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
      console.error("LinkTop test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Không thể kết nối đến LinkTop API",
      };
    }
  }
}

export default LinkTopService;
