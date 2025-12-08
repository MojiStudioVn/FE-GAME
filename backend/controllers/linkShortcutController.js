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
export async function createLinkShortcut(req, res) {
  try {
    const { provider, url } = req.body;
    if (!provider || !url)
      return res.status(400).json({ message: "Thiếu provider hoặc url" });
    const config = PROVIDER_CONFIG[provider];
    // Lấy apiKey từ database
    const providerDoc = await APIProvider.findOne({
      provider,
      status: "active",
    });
    if (!providerDoc || !providerDoc.apiKey)
      return res
        .status(500)
        .json({ message: `Chưa cấu hình API key cho ${provider}` });
    const apiKey = providerDoc.apiKey;

    // Gọi API provider theo từng flow cụ thể
    try {
      // linktop (POST)
      if (provider === "linktop") {
        if (!config)
          return res.status(400).json({ message: "Provider không hỗ trợ" });
        const apiRes = await axios.post(
          config.apiUrl,
          { url },
          { headers: { Authorization: apiKey } }
        );
        if (apiRes.data && apiRes.data.data && apiRes.data.data.shortUrl) {
          return res.json({ shortcut: apiRes.data.data.shortUrl });
        }
        return res
          .status(400)
          .json({ message: "Không tạo được link rút gọn từ linktop" });
      }

      // link4m (GET)
      if (provider === "link4m") {
        if (!config)
          return res.status(400).json({ message: "Provider không hỗ trợ" });
        const apiRes = await axios.get(
          config.apiUrl + `?api=${apiKey}&url=${encodeURIComponent(url)}`
        );
        if (apiRes.data && apiRes.data.shortenedUrl) {
          return res.json({ shortcut: apiRes.data.shortenedUrl });
        }
        return res
          .status(400)
          .json({ message: "Không tạo được link rút gọn từ link4m" });
      }

      // site2s (GET query: ?api=APIKEY&url=...&alias=...)
      if (provider === "site2s") {
        const diagnostics = { missing: [] };
        // Use providerDoc.apiUrl if present, otherwise use known base
        let base =
          providerDoc.apiUrl && providerDoc.apiUrl.length > 0
            ? providerDoc.apiUrl
            : "https://site2s.com/api";

        // Ensure apiKey exists
        if (!apiKey) diagnostics.missing.push("providerDoc.apiKey");

        // Normalize and validate url: if doesn't start with http(s), prefix https://
        let normalizedUrl = url;
        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = `https://${normalizedUrl}`;
          diagnostics.note = diagnostics.note || [];
          diagnostics.note.push("url prefixed with https://");
        }

        // Normalize base: ensure it has protocol and path
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
          base = `https://${base}`;
        }
        try {
          const u = new URL(base);
          if (u.pathname === "/" || u.pathname === "") {
            base = `${u.origin}/api`;
          }
        } catch (e) {
          // ignore URL parse errors and use base as-is
        }

        // Generate a random uppercase alias of length 10
        const generateAlias = (len = 10) => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let out = "";
          for (let i = 0; i < len; i++)
            out += chars.charAt(Math.floor(Math.random() * chars.length));
          return out;
        };
        const alias = generateAlias(10);
        console.log(`Generated alias for site2s: ${alias}`);
        const getUrl = `${base}${
          base.includes("?") ? "&" : "?"
        }api=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(
          normalizedUrl
        )}&alias=${encodeURIComponent(alias)}`;
        console.log(`Calling site2s GET: ${getUrl}`);

        if (diagnostics.missing.length > 0) {
          return res.status(400).json({
            message: "Thiếu thông tin cấu hình cho provider",
            details: diagnostics,
          });
        }

        try {
          const apiRes = await axios.get(getUrl);
          console.log(
            `Provider response status: ${apiRes.status}`,
            apiRes.data
          );
          if (apiRes.data) {
            // Accept several possible shapes returned by site2s
            if (typeof apiRes.data === "string") {
              return res.json({
                shortcut: apiRes.data,
                debug: { calledUrl: getUrl },
              });
            }
            if (apiRes.data.shortenedUrl) {
              return res.json({
                shortcut: apiRes.data.shortenedUrl,
                debug: { calledUrl: getUrl },
              });
            }
            if (apiRes.data.shortUrl) {
              return res.json({
                shortcut: apiRes.data.shortUrl,
                debug: { calledUrl: getUrl },
              });
            }
            if (apiRes.data.url) {
              return res.json({
                shortcut: apiRes.data.url,
                debug: { calledUrl: getUrl },
              });
            }
            // Some providers return a status + empty message, handle success shape
            if (
              apiRes.data.status &&
              apiRes.data.status.toLowerCase() === "success" &&
              apiRes.data.shortenedUrl
            ) {
              return res.json({
                shortcut: apiRes.data.shortenedUrl,
                debug: { calledUrl: getUrl },
              });
            }
          }
          return res.status(400).json({
            message: "Không tạo được link rút gọn từ site2s",
            details: {
              calledUrl: getUrl,
              responseStatus: apiRes.status,
              responseData: apiRes.data,
            },
          });
        } catch (err) {
          console.error(
            "Error calling site2s:",
            err?.response?.data || err.message || err
          );
          const respData = err?.response?.data;
          const status = err?.response?.status || 500;
          return res.status(status).json({
            message: "Lỗi khi gọi site2s",
            details: {
              calledUrl: getUrl,
              responseStatus: status,
              responseData: respData,
              maskedApiKey: maskKey(apiKey),
            },
          });
        }
      }

      // Nếu không thuộc các provider đã hỗ trợ
      // Generic: nếu có config (PROVIDER_CONFIG hoặc providerDoc.apiUrl), thử gọi GET ?api=...&url=...&alias=...
      if (config || (providerDoc && providerDoc.apiUrl)) {
        try {
          let base = (config && config.apiUrl) || providerDoc.apiUrl;
          if (!base)
            return res.status(400).json({ message: "Provider không hỗ trợ" });
          if (!base.startsWith("http://") && !base.startsWith("https://")) {
            base = `https://${base}`;
          }
          try {
            const u = new URL(base);
            if (u.pathname === "/" || u.pathname === "") {
              base = `${u.origin}/api`;
            }
          } catch (e) {
            // ignore
          }
          // Generate alias automatically (10 uppercase chars) and retry if alias exists
          const originalAlias = req.body.alias || generateAlias(10);
          let aliasTry = originalAlias;
          let attempts = 0;
          let lastResp = null;
          while (attempts < 4) {
            attempts += 1;
            const getUrl = `${base}${
              base.includes("?") ? "&" : "?"
            }api=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(
              url
            )}&alias=${encodeURIComponent(aliasTry)}`;
            console.log(
              `Calling provider GET (${provider}) attempt ${attempts}: ${getUrl}`
            );
            try {
              const apiRes = await axios.get(getUrl);
              console.log(
                `Provider response status: ${apiRes.status}`,
                apiRes.data
              );
              lastResp = { apiRes, calledUrl: getUrl };
              const data = apiRes.data;
              if (data) {
                if (typeof data === "string")
                  return res.json({
                    shortcut: data,
                    debug: { calledUrl: getUrl, alias: aliasTry },
                  });
                if (data.shortenedUrl)
                  return res.json({
                    shortcut: data.shortenedUrl,
                    debug: { calledUrl: getUrl, alias: aliasTry },
                  });
                if (data.shortUrl)
                  return res.json({
                    shortcut: data.shortUrl,
                    debug: { calledUrl: getUrl, alias: aliasTry },
                  });
                if (data.url)
                  return res.json({
                    shortcut: data.url,
                    debug: { calledUrl: getUrl, alias: aliasTry },
                  });
                if (data.data && data.data.shortUrl)
                  return res.json({
                    shortcut: data.data.shortUrl,
                    debug: { calledUrl: getUrl, alias: aliasTry },
                  });

                // handle provider error payloads indicating alias conflict
                if (
                  data.status === "error" ||
                  data.status === "failed" ||
                  data.status === "0"
                ) {
                  const msg = Array.isArray(data.message)
                    ? data.message.join("; ")
                    : data.message || "";
                  if (
                    /alias already exists/i.test(msg) ||
                    /Alias already exists/i.test(msg) ||
                    /already exists/i.test(msg)
                  ) {
                    aliasTry = generateAlias(10);
                    console.log(
                      `Alias conflict detected, retrying with ${aliasTry}`
                    );
                    continue;
                  }
                  // other error from provider
                  return res
                    .status(400)
                    .json({
                      message: `Không tạo được link rút gọn từ ${provider}`,
                      details: {
                        calledUrl: getUrl,
                        responseStatus: apiRes.status,
                        responseData: data,
                      },
                    });
                }
              }
              // If no usable data, break and report
              return res
                .status(400)
                .json({
                  message: `Không tạo được link rút gọn từ ${provider}`,
                  details: {
                    calledUrl: getUrl,
                    responseStatus: apiRes.status,
                    responseData: apiRes.data,
                  },
                });
            } catch (err) {
              console.error(
                `Error calling provider ${provider} (attempt ${attempts}):`,
                err?.response?.data || err.message || err
              );
              const respData = err?.response?.data;
              const status = err?.response?.status || 500;
              // If provider responded with alias conflict structure inside error response, try again
              const msg =
                respData &&
                (Array.isArray(respData.message)
                  ? respData.message.join("; ")
                  : respData.message || "");
              if (
                msg &&
                (/alias already exists/i.test(msg) ||
                  /Alias already exists/i.test(msg) ||
                  /already exists/i.test(msg))
              ) {
                aliasTry = generateAlias(10);
                console.log(
                  `Alias conflict detected in error response, retrying with ${aliasTry}`
                );
                continue;
              }
              lastResp = {
                err,
                calledUrl: getUrl,
                responseData: respData,
                status,
              };
              // try again with new alias
              aliasTry = generateAlias(10);
              continue;
            }
          }
          // exhausted attempts
          if (lastResp) {
            if (lastResp.apiRes)
              return res
                .status(400)
                .json({
                  message: `Không tạo được link rút gọn từ ${provider}`,
                  details: {
                    calledUrl: lastResp.calledUrl,
                    responseStatus: lastResp.apiRes.status,
                    responseData: lastResp.apiRes.data,
                  },
                });
            const lr = lastResp;
            return res
              .status(lr.status || 500)
              .json({
                message: `Lỗi khi gọi ${provider}`,
                details: {
                  calledUrl: lr.calledUrl,
                  responseStatus: lr.status,
                  responseData: lr.responseData,
                  maskedApiKey: maskKey(apiKey),
                },
              });
          }
          return res
            .status(500)
            .json({ message: `Không tạo được link rút gọn từ ${provider}` });
        } catch (err) {
          console.error(
            `Error calling generic provider ${provider}:`,
            err?.response?.data || err.message || err
          );
          return res.status(500).json({ message: "Lỗi khi gọi nhà cung cấp" });
        }
      }
      return res.status(400).json({ message: "Provider không hỗ trợ" });
    } catch (err) {
      console.error(
        "Error calling provider API:",
        err?.response?.data || err.message || err
      );
      return res.status(500).json({ message: "Lỗi khi gọi nhà cung cấp" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
