import axios from "axios";

/**
 * YeuMoney API Service
 * Documentation: yeumoney.com API
 *
 * Features:
 * - Shorten URL
 * - Supports JSON and TEXT format
 */

class YeuMoneyService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://yeumoney.com";
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
        token: this.apiKey,
        format: "json",
        url: url,
      });

      const apiUrl = `${this.baseUrl}/QL_api.php?${params.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data.status === "success") {
        return {
          success: true,
          shortenedUrl: response.data.shortenedUrl,
          originalUrl: url,
        };
      } else {
        throw new Error(response.data.status || "Failed to shorten URL");
      }
    } catch (error) {
      console.error("YeuMoney shorten error:", error.message);
      return {
        success: false,
        error: error.response?.data?.status || error.message,
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
        token: this.apiKey,
        format: "json",
        url: testUrl,
      });

      const apiUrl = `${this.baseUrl}/QL_api.php?${params.toString()}`;
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
          message: response.data.status || "API Token không hợp lệ",
        };
      }
    } catch (error) {
      console.error("YeuMoney test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.status ||
          error.message ||
          "Không thể kết nối đến YeuMoney API",
      };
    }
  }
}

export default YeuMoneyService;
