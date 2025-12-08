import axios from "axios";

/**
 * YeuLink API Service
 * Documentation: yeulink.com API
 *
 * Features:
 * - Shorten URL
 * - Create note (optional)
 */

class YeuLinkService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://yeulink.com";
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
        token: this.apiKey,
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
      console.error("YeuLink shorten error:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Create a note with shortened URL
   * @param {string} content - Note content
   * @param {object} options - Optional parameters
   * @param {string} options.title - Note title
   * @param {string} options.alias - Custom alias
   * @returns {Promise<object>} Shortened note URL response
   */
  async createNote(content, options = {}) {
    try {
      const { title, alias } = options;

      const params = new URLSearchParams({
        token: this.apiKey,
        content: content,
      });

      if (title) params.append("title", title);
      if (alias) params.append("alias", alias);

      const apiUrl = `${this.baseUrl}/note-api?${params.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data.status === "success") {
        return {
          success: true,
          shortenedUrl: response.data.shortenedUrl,
          content: content,
        };
      } else {
        throw new Error(response.data.message || "Failed to create note");
      }
    } catch (error) {
      console.error("YeuLink create note error:", error.message);
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
        token: this.apiKey,
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
      console.error("YeuLink test connection error:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Không thể kết nối đến YeuLink API",
      };
    }
  }
}

export default YeuLinkService;
