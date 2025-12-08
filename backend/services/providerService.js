import Site2SService from "./Site2SService.js";
import FunLinkService from "./FunLinkService.js";
import LinkTopService from "./LinkTopService.js";
import Link4MService from "./Link4MService.js";
import YeuLinkService from "./YeuLinkService.js";
import YeuMoneyService from "./YeuMoneyService.js";
import LinkNgonService from "./LinkNgonService.js";
import LinkNgonNetService from "./LinkNgonNetService.js";
import LinkNgonIoService from "./LinkNgonIoService.js";
import FourMMOService from "./FourMMOService.js";
import BBMktsService from "./BBMktsService.js";
import UpToLinkService from "./UpToLinkService.js";

/**
 * Provider Service Factory
 * Creates service instances based on provider type
 */

const createProviderService = (provider, apiKey) => {
  switch (provider) {
    case "site2s":
      return new Site2SService(apiKey);

    case "funlink":
      return new FunLinkService(apiKey);

    case "linktop":
      return new LinkTopService(apiKey);

    case "link4m":
      return new Link4MService(apiKey);

    case "yeulink":
      return new YeuLinkService(apiKey);

    case "yeumoney":
      return new YeuMoneyService(apiKey);

    case "linkngon":
      return new LinkNgonService(apiKey);

    case "linkngon-net":
      return new LinkNgonNetService(apiKey);

    case "linkngon-io":
      return new LinkNgonIoService(apiKey);

    case "4mmo":
      return new FourMMOService(apiKey);

    case "bbmkts":
      return new BBMktsService(apiKey);

    case "uptolink":
      return new UpToLinkService(apiKey);

    // Add more providers here as they are implemented

    default:
      throw new Error(`Provider ${provider} not implemented yet`);
  }
};

/**
 * Shorten URL using specified provider
 */
export const shortenUrl = async (provider, apiKey, url, options = {}) => {
  try {
    const service = createProviderService(provider, apiKey);
    return await service.shortenUrl(url, options);
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get account stats from provider
 */
export const getAccountStats = async (provider, apiKey) => {
  try {
    const service = createProviderService(provider, apiKey);

    // Different providers may have different methods
    if (service.getRemainingViews) {
      return await service.getRemainingViews();
    }

    return {
      success: false,
      error: "Provider does not support account stats",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check link statistics
 */
export const checkLinkStats = async (provider, apiKey, slug) => {
  try {
    const service = createProviderService(provider, apiKey);

    if (service.checkLinkViews) {
      return await service.checkLinkViews(slug);
    }

    return {
      success: false,
      error: "Provider does not support link stats",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test provider API connection
 */
export const testProviderConnection = async (provider, apiKey) => {
  try {
    const service = createProviderService(provider, apiKey);
    return await service.testConnection();
  } catch (error) {
    return {
      success: false,
      message: error.message || "Không thể tạo kết nối đến provider",
    };
  }
};

export default {
  shortenUrl,
  getAccountStats,
  checkLinkStats,
  testProviderConnection,
};
