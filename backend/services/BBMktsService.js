import axios from "axios";

/**
 * BBMkts API Service
 * Documentation: bbmkts.com API
 *
 * Features:
 * - Shorten URL
 * - Supports sublink (link phụ)
 */

class BBMktsService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://bbmkts.com";
  }

  /**
   * Shorten a URL
   * @param {string} url - The URL to shorten
   * @param {object} options - Optional parameters
   * @param {string} options.suburl - Sublink (link phụ/link dự phòng)
   * @returns {Promise<object>} Shortened URL response
   */
  async shortenUrl(url, options = {}) {
    try {
      const { suburl } = options;

      const params = new URLSearchParams({
        token: this.apiKey,
        longurl: url,
      });

      if (suburl) params.append("suburl", suburl);

      const apiUrl = `${this.baseUrl}/ql?${params.toString()}`;
      const response = await axios.get(apiUrl);

      // BBMkts redirects to the shortened URL, we need to extract it from the response
      // If successful, the response should contain the shortened URL
      if (
        response.data &&
        typeof response.data === "string" &&
        response.data.includes("bbmkts.com")
      ) {
        return {
          success: true,
          shortenedUrl: response.data.trim(),
          originalUrl: url,
        };
      } else if (
        response.request &&
        response.request.responseURL &&
        response.request.responseURL.includes("bbmkts.com")
      ) {
        // If redirected, get the final URL
        return {
          success: true,
          shortenedUrl: response.request.responseURL,
          originalUrl: url,
        };
      } else {
        throw new Error("Failed to get shortened URL from BBMkts");
      }
    } catch (error) {
      console.error("BBMkts shorten error:", error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
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
        longurl: testUrl,
      });

      const apiUrl = `${this.baseUrl}/ql?${params.toString()}`;
      const response = await axios.get(apiUrl);

      // Check if we got a shortened URL
      if (
        response.data &&
        typeof response.data === "string" &&
        response.data.includes("bbmkts.com")
      ) {
        return {
          success: true,
          message: "Kết nối thành công! API Token hợp lệ.",
          shortenedUrl: response.data.trim(),
        };
      } else if (
        response.request &&
        response.request.responseURL &&
        response.request.responseURL.includes("bbmkts.com")
      ) {
        return {
          success: true,
          message: "Kết nối thành công! API Token hợp lệ.",
          shortenedUrl: response.request.responseURL,
        };
      } else {
        return {
          success: false,
          message: "API Token không hợp lệ hoặc không nhận được response",
        };
      }
    } catch (error) {
      console.error("BBMkts test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data ||
          error.message ||
          "Không thể kết nối đến BBMkts API",
      };
    }
  }
}

export default BBMktsService;
