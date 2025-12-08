import axios from "axios";

/**
 * FunLink.io API Service
 * Documentation: private.funlink.io API
 *
 * Features:
 * - Shorten URL
 * - Get remaining quota
 */

class FunLinkService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://private.funlink.io";
    this.domain = "funlink.io";
  }

  /**
   * Shorten a URL
   * @param {string} url - The URL to shorten
   * @param {object} options - Optional parameters (not used by FunLink)
   * @returns {Promise<object>} Shortened URL response
   */
  async shortenUrl(url, options = {}) {
    try {
      const apiUrl = `${this.baseUrl}/api/cong-khai/tao-lien-ket`;
      const params = {
        apikey: this.apiKey,
        url: url,
      };

      const response = await axios.get(apiUrl, { params });

      // Check if response has error
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Response format: {"id": "DHS3DCM", "url": "https://yourlink.com", "remaining": 999}
      if (response.data.id) {
        return {
          success: true,
          shortenedUrl: `https://${this.domain}/${response.data.id}`,
          originalUrl: url,
          slug: response.data.id,
          remaining: response.data.remaining,
        };
      } else {
        throw new Error("Không nhận được mã rút gọn từ FunLink");
      }
    } catch (error) {
      console.error("FunLink shorten error:", error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get remaining quota for the account
   * @returns {Promise<object>} Remaining quota data
   */
  async getRemainingQuota() {
    try {
      // Make a test request to get remaining quota
      const testUrl = "https://mojistudio.vn";
      const apiUrl = `${this.baseUrl}/api/cong-khai/tao-lien-ket`;
      const params = {
        apikey: this.apiKey,
        url: testUrl,
      };

      const response = await axios.get(apiUrl, { params });

      if (response.data.remaining !== undefined) {
        return {
          success: true,
          remaining: response.data.remaining,
          message: `Còn ${response.data.remaining} lượt rút gọn trong ngày`,
        };
      }

      return {
        success: false,
        error: "Không thể lấy thông tin quota",
      };
    } catch (error) {
      console.error("FunLink quota error:", error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Test API connection by shortening a test URL
   * @returns {Promise<object>} Test result with success status and details
   */
  async testConnection() {
    try {
      // Test by shortening the domain URL
      const testUrl = "https://mojistudio.vn";
      const apiUrl = `${this.baseUrl}/api/cong-khai/tao-lien-ket`;
      const params = {
        apikey: this.apiKey,
        url: testUrl,
      };

      const response = await axios.get(apiUrl, { params });

      if (response.data.id) {
        return {
          success: true,
          message: `Kết nối thành công! Còn ${response.data.remaining} lượt rút gọn trong ngày.`,
          shortenedUrl: `https://${this.domain}/${response.data.id}`,
          remaining: response.data.remaining,
        };
      } else if (response.data.error) {
        return {
          success: false,
          message: response.data.error,
        };
      } else {
        return {
          success: false,
          message: "API Key không hợp lệ hoặc đã hết quota",
        };
      }
    } catch (error) {
      console.error("FunLink test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          "Không thể kết nối đến FunLink API",
      };
    }
  }
}

export default FunLinkService;
