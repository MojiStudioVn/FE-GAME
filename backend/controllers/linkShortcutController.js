import axios from "axios";
import APIProvider from "../models/APIProvider.js";

// Map provider key sang endpoint
const PROVIDER_CONFIG = {
  linktop: { apiUrl: "https://api.linktop.one/api/public/create-shortlink" },
  link4m: { apiUrl: "https://link4m.com/api-create/shorten" },
  yeulink: { apiUrl: "https://yeulink.com/api" },
  yeumoney: { apiUrl: "https://yeumoney.com/api" },
  site2s: { apiUrl: "https://site2s.com/api" },
  funlink: { apiUrl: "https://funlink.io/api" },
  linkngon: { apiUrl: "https://linkngon.com/api" },
  "linkngon-net": { apiUrl: "https://linkngon.net/api" },
  "linkngon-io": { apiUrl: "https://linkngon.io/api" },
  "4mmo": { apiUrl: "https://4mmo.net/api" },
  bbmkts: { apiUrl: "https://bbmkts.com/api" },
  uptolink: { apiUrl: "https://uptolink.one/api" },
  // Note: these apiUrl values are default guesses. You can override per-provider apiUrl in DB (APIProvider.apiUrl).
};

function maskKey(key) {
  if (!key) return null;
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "..." + key.slice(-4);
}
// Generate alias helper (10 uppercase letters)
function generateAlias(len = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

// Reusable function to create a short link for a provider programmatically
export async function createShortLink(provider, url, aliasFromRequest) {
  if (!provider || !url) throw new Error("Missing provider or url");
  const config = PROVIDER_CONFIG[provider];
  const providerDoc = await APIProvider.findOne({ provider, status: "active" });
  if (!providerDoc || !providerDoc.apiKey)
    throw new Error(`Chưa cấu hình API key cho ${provider}`);
  const apiKey = providerDoc.apiKey;

  // normalize URL
  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(normalizedUrl))
    normalizedUrl = `https://${normalizedUrl}`;

  // site2s special-case
  // linktop (POST)
  if (provider === "linktop") {
    if (!config) throw new Error("Provider không hỗ trợ");
    const apiRes = await axios.post(
      config.apiUrl,
      { url },
      { headers: { Authorization: apiKey } }
    );
    if (apiRes.data && apiRes.data.data && apiRes.data.data.shortUrl) {
      return {
        shortcut: apiRes.data.data.shortUrl,
        alias: aliasFromRequest || null,
      };
    }
    throw new Error(`Không tạo được link rút gọn từ ${provider}`);
  }

  // site2s special-case
  if (provider === "site2s") {
    let base =
      providerDoc.apiUrl && providerDoc.apiUrl.length > 0
        ? providerDoc.apiUrl
        : "https://site2s.com/api";
    if (!base.startsWith("http://") && !base.startsWith("https://"))
      base = `https://${base}`;
    try {
      const u = new URL(base);
      if (u.pathname === "/" || u.pathname === "") base = `${u.origin}/api`;
    } catch (e) {}

    const alias = aliasFromRequest || generateAlias(10);
    const getUrl = `${base}${
      base.includes("?") ? "&" : "?"
    }api=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(
      normalizedUrl
    )}&alias=${encodeURIComponent(alias)}`;
    const apiRes = await axios.get(getUrl);
    const data = apiRes.data;
    if (data) {
      if (typeof data === "string") return { shortcut: data, alias };
      if (data.shortenedUrl) return { shortcut: data.shortenedUrl, alias };
      if (data.shortUrl) return { shortcut: data.shortUrl, alias };
      if (data.url) return { shortcut: data.url, alias };
      if (
        data.status &&
        data.status.toLowerCase() === "success" &&
        data.shortenedUrl
      )
        return { shortcut: data.shortenedUrl, alias };
    }
    throw new Error(`Không tạo được link rút gọn từ ${provider}`);
  }

  // Generic provider GET flow (with alias retry)
  if (config || (providerDoc && providerDoc.apiUrl)) {
    let base = (config && config.apiUrl) || providerDoc.apiUrl;
    if (!base) throw new Error("Provider không hỗ trợ");
    if (!base.startsWith("http://") && !base.startsWith("https://"))
      base = `https://${base}`;
    try {
      const u = new URL(base);
      if (u.pathname === "/" || u.pathname === "") base = `${u.origin}/api`;
    } catch (e) {}

    let originalAlias = aliasFromRequest || generateAlias(10);
    let aliasTry = originalAlias;
    let attempts = 0;
    while (attempts < 4) {
      attempts += 1;
      const getUrl = `${base}${
        base.includes("?") ? "&" : "?"
      }api=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(
        normalizedUrl
      )}&alias=${encodeURIComponent(aliasTry)}`;
      try {
        const apiRes = await axios.get(getUrl);
        const data = apiRes.data;
        if (data) {
          if (typeof data === "string")
            return { shortcut: data, alias: aliasTry };
          if (data.shortenedUrl)
            return { shortcut: data.shortenedUrl, alias: aliasTry };
          if (data.shortUrl)
            return { shortcut: data.shortUrl, alias: aliasTry };
          if (data.url) return { shortcut: data.url, alias: aliasTry };
          if (data.data && data.data.shortUrl)
            return { shortcut: data.data.shortUrl, alias: aliasTry };

          const msg = Array.isArray(data.message)
            ? data.message.join("; ")
            : data.message || "";
          if (
            /alias already exists/i.test(msg) ||
            /already exists/i.test(msg)
          ) {
            aliasTry = generateAlias(10);
            continue;
          }
        }
        throw new Error(`Không tạo được link rút gọn từ ${provider}`);
      } catch (err) {
        const respData = err?.response?.data;
        const msg =
          respData &&
          (Array.isArray(respData.message)
            ? respData.message.join("; ")
            : respData.message || "");
        if (
          msg &&
          (/alias already exists/i.test(msg) || /already exists/i.test(msg))
        ) {
          aliasTry = generateAlias(10);
          continue;
        }
        // try next alias
        aliasTry = generateAlias(10);
        continue;
      }
    }
    throw new Error(`Không tạo được link rút gọn từ ${provider}`);
  }

  throw new Error("Provider không hỗ trợ");
}
export async function createLinkShortcut(req, res) {
  try {
    const { provider, url, alias } = req.body;
    if (!provider || !url)
      return res.status(400).json({ message: "Thiếu provider hoặc url" });
    try {
      const result = await createShortLink(provider, url, alias);
      return res.json({ shortcut: result.shortcut, alias: result.alias });
    } catch (err) {
      console.error(
        "Error creating short link:",
        err?.response?.data || err.message || err
      );
      return res
        .status(500)
        .json({ message: err.message || "Lỗi khi tạo link rút gọn" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
