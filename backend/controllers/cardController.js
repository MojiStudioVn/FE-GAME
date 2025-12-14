import crypto from "crypto";
import axios from "axios";
import CardTransaction from "../models/CardTransaction.js";
import CardPurchase from "../models/CardPurchase.js";
import User from "../models/User.js";
import Log from "../models/Log.js";
import { createUserLog } from "../utils/logService.js";
import PaymentConfig from "../models/PaymentConfig.js";

// Mask sensitive strings (keep last 4 chars)
const maskSensitive = (str) => {
  try {
    if (!str || typeof str !== "string") return "-";
    if (str.length <= 4) return "****";
    const last = str.slice(-4);
    return "****" + last;
  } catch (e) {
    return "-";
  }
};
// Configuration
const DOMAIN_POST = process.env.CARD_DOMAIN_POST || "thenapvip.com";

// Get payment config from database
const getPaymentConfig = async () => {
  let config = await PaymentConfig.findOne().lean();
  if (!config) {
    throw new Error(
      "Payment configuration not found. Please configure in admin settings."
    );
  }
  return config;
};

// Generate MD5 signature
const generateSign = (partnerKey, code, serial) => {
  const data = partnerKey + code + serial;
  return crypto.createHash("md5").update(data).digest("hex");
};

// Generate MD5 for buycard: md5(partner_key + partner_id + command + request_id)
const generateBuySign = (partnerKey, partnerId, command, requestId) => {
  const data = `${partnerKey}${partnerId}${command}${requestId}`;
  return crypto.createHash("md5").update(data).digest("hex");
};

// @desc    Submit card to charging system
// @route   POST /api/card/charge
// @access  Private
export const chargeCard = async (req, res) => {
  try {
    const { telco, code, serial, amount } = req.body;

    // Validate input
    if (!telco || !code || !serial || !amount) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin thẻ",
      });
    }

    // Validate telco - allow additional providers (ZING, GATE, GARENA)
    if (
      !["VIETTEL", "MOBIFONE", "VINAPHONE", "ZING", "GATE", "GARENA"].includes(
        telco
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Nhà mạng không hợp lệ",
      });
    }

    // Get payment config
    const config = await getPaymentConfig();

    // Generate unique request_id
    const requestId = `${req.user.id}_${Date.now()}`;

    // Generate signature
    const sign = generateSign(config.partnerKey, code, serial);

    // Create transaction record
    const transaction = await CardTransaction.create({
      userId: req.user.id,
      requestId,
      telco,
      code,
      serial,
      declaredValue: amount,
      status: 99, // Pending
      message: "Đang xử lý",
    });

    // Prepare form data for API call
    const formData = new URLSearchParams();
    formData.append("telco", telco);
    formData.append("code", code);
    formData.append("serial", serial);
    formData.append("amount", amount.toString());
    formData.append("request_id", requestId);
    formData.append("partner_id", config.partnerId);
    formData.append("sign", sign);
    formData.append("command", "charging");

    try {
      // Call charging API
      const response = await axios.post(
        `http://${DOMAIN_POST}/chargingws/v2`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000, // 30 seconds
        }
      );

      // Update transaction with response (normalize status to Number)
      const respStatus = Number(response?.data?.status);
      transaction.transId = response.data.trans_id;
      transaction.status = isNaN(respStatus)
        ? response.data.status
        : respStatus;
      transaction.message = response.data.message || "";
      await transaction.save();

      // Create log
      await createUserLog(req, {
        message: `Gửi thẻ: request ${requestId} - telco ${telco}`,
        source: "backend",
        page: "/card/charge",
        meta: {
          type: "card_charge",
          requestId,
          telco,
          declaredValue: amount,
          status: response.data.status,
          codeMasked: maskSensitive(code),
          serialMasked: maskSensitive(serial),
        },
      });

      // If provider returned a non-success status, report that as an error to client
      // Common successful statuses are 1 (correct value) or 2 (wrong value but accepted)
      if (respStatus !== 1 && respStatus !== 2) {
        return res.status(502).json({
          success: false,
          message: response.data.message || "Nhà cung cấp trả lỗi",
          data: {
            requestId,
            transId: response.data.trans_id,
            status: response.data.status,
          },
        });
      }

      // success path
      res.status(200).json({
        success: true,
        message: "Gửi thẻ thành công",
        data: {
          requestId,
          transId: response.data.trans_id,
          status: response.data.status,
          message: response.data.message,
        },
      });
    } catch (apiError) {
      // Update transaction as failed
      transaction.status = 100;
      transaction.message = apiError.message || "Gửi thẻ thất bại";
      await transaction.save();

      console.error("❌ Card API Error:", apiError.message);

      res.status(500).json({
        success: false,
        message: "Không thể kết nối đến hệ thống nạp thẻ",
        error: apiError.message,
      });
    }
  } catch (error) {
    console.error("❌ Error charging card:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra",
      error: error.message,
    });
  }
};

// @desc    Handle callback from charging system
// @route   POST /api/card/callback
// @access  Public (but verified by signature)
export const cardCallback = async (req, res) => {
  try {
    // Some providers call back with GET (query) instead of POST (body).
    // Merge both so we can handle either case and avoid destructuring undefined.
    const payload = { ...(req.body || {}), ...(req.query || {}) };

    const {
      status,
      message,
      request_id,
      declared_value,
      value,
      card_value,
      amount,
      code,
      serial,
      telco,
      trans_id,
      callback_sign,
      sign,
      command,
    } = payload;

    console.log("📥 Card callback received:", req.body);

    // Get payment config
    const config = await getPaymentConfig();

    // Verify signature - support both charging callbacks (md5(partnerKey+code+serial))
    // and buy/getbalance callbacks (md5(partnerKey+partnerId+command+request_id)).
    const receivedSign =
      callback_sign || sign || payload.callbackSign || payload.callback_sign;
    const expectedSignCharging =
      code && serial ? generateSign(config.partnerKey, code, serial) : null;
    const expectedSignBuy =
      typeof request_id !== "undefined" && command
        ? generateBuySign(
            config.partnerKey || "",
            config.partnerId || "",
            command,
            request_id || ""
          )
        : null;

    const signatureValid =
      (expectedSignCharging && receivedSign === expectedSignCharging) ||
      (expectedSignBuy && receivedSign === expectedSignBuy);

    if (!signatureValid) {
      console.error("❌ Invalid callback signature", {
        receivedSign,
        expectedSignCharging,
        expectedSignBuy,
      });
      return res
        .status(403)
        .json({ success: false, message: "Invalid signature" });
    }

    // Try to find a matching CardTransaction or CardPurchase by request_id
    const transaction = await CardTransaction.findOne({
      requestId: request_id,
    });
    const purchase = await CardPurchase.findOne({ requestId: request_id });

    if (!transaction && !purchase) {
      console.error("❌ Transaction or Purchase not found:", request_id);
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    // If it's a charging transaction callback, update CardTransaction
    if (transaction) {
      transaction.status = status;
      transaction.message = message;
      transaction.transId = trans_id;
      transaction.declaredValue = declared_value;
      transaction.cardValue = card_value || value;
      transaction.value = value;
      transaction.amount = amount;
      transaction.callbackSign = receivedSign;
      await transaction.save();
    }

    // If it's a buy/purchase callback, update CardPurchase
    if (purchase) {
      purchase.status = status;
      purchase.message = message || purchase.message;
      purchase.transId = trans_id || purchase.transId;
      purchase.providerResponse = {
        ...(purchase.providerResponse || {}),
        ...(payload || {}),
      };
      await purchase.save();
    }

    // If success (status 1 or 2), add coins to user based on discount rate
    if (status === 1 || status === 2) {
      const config = await getPaymentConfig();
      const user = await User.findById(transaction.userId);

      if (user) {
        // Calculate coins based on discount rate
        const discountRate = config.cardDiscount[telco] || 70;
        const coinAmount = Math.floor(
          (card_value || value) * (discountRate / 100)
        );

        user.coins += coinAmount;
        await user.save();

        // Update transaction with actual coin amount
        transaction.amount = coinAmount;
        await transaction.save();

        // Create log
        await createUserLog(req, {
          message: `Nạp thẻ thành công: request ${request_id} - trans ${trans_id}`,
          source: "backend",
          page: "/card/callback",
          meta: {
            type: "card_recharge",
            requestId: request_id,
            transId: trans_id,
            telco,
            declaredValue: declared_value,
            cardValue: card_value || value,
            discountRate,
            amount: coinAmount,
            status,
            statusText: status === 1 ? "Đúng mệnh giá" : "Sai mệnh giá",
            codeMasked: maskSensitive(transaction.code),
            serialMasked: maskSensitive(transaction.serial),
          },
        });

        console.log(
          `✅ Added ${coinAmount} coins to user ${user.username} (Card ${
            status === 1 ? "correct" : "wrong"
          } value, discount: ${discountRate}%)`
        );
      }
    } else if (status === 3) {
      // Card error
      await createUserLog(req, {
        message: `Lỗi nạp thẻ: request ${request_id} - ${message}`,
        source: "backend",
        page: "/card/callback",
        meta: {
          type: "card_error",
          requestId: request_id,
          transId: trans_id,
          telco,
          codeMasked: maskSensitive(code),
          serialMasked: maskSensitive(serial),
          message,
        },
        // in some callbacks req.user may be empty; include userId from transaction if available
        userId: transaction?.userId || undefined,
      });
    }

    res.status(200).json({
      success: true,
      message: "Callback processed",
    });
  } catch (error) {
    console.error("❌ Error processing callback:", error);
    res.status(500).json({
      success: false,
      message: "Callback processing failed",
      error: error.message,
    });
  }
};

// @desc    Get user card transactions
// @route   GET /api/card/history
// @access  Private
export const getCardHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      CardTransaction.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CardTransaction.countDocuments({ userId: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error getting card history:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử nạp thẻ",
      error: error.message,
    });
  }
};

// @desc    Get all card transactions (Admin)
// @route   GET /api/card/admin/all
// @access  Private/Admin
export const getAllCardTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) {
      query.status = Number(status);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      CardTransaction.find(query)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CardTransaction.countDocuments(query),
    ]);

    // Get stats
    const stats = await CardTransaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Compute totals only from successful transactions (status 1 or 2)
    const successTotals = await CardTransaction.aggregate([
      { $match: { status: { $in: [1, 2] }, amount: { $exists: true } } },
      {
        $group: {
          _id: null,
          totalSuccessAmount: { $sum: "$amount" },
          successCount: { $sum: 1 },
        },
      },
    ]);

    const totalSuccessAmount = successTotals[0]?.totalSuccessAmount || 0;
    const successCount = successTotals[0]?.successCount || 0;

    res.status(200).json({
      success: true,
      data: transactions,
      stats,
      totals: {
        totalSuccessAmount,
        successCount,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error getting all card transactions:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách giao dịch",
      error: error.message,
    });
  }
};

// @desc    Admin audit view for a card transaction (returns full code/serial)
// @route   GET /api/admin/card/audit/:requestId
// @access  Private/Admin
export const getCardAudit = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu requestId" });
    }

    // Try different matches: requestId, transId numeric, or document _id
    const query = {
      $or: [
        { requestId: String(requestId) },
        { transId: Number(requestId) },
        { _id: requestId },
      ],
    };

    const transaction = await CardTransaction.findOne(query).lean();

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy giao dịch" });
    }

    // Log the audit access (do not store full sensitive values in audit log)
    await createUserLog(req, {
      message: `Audit viewed card transaction ${requestId}`,
      source: "backend",
      page: "/admin/card/audit",
      meta: {
        type: "card_audit",
        requestId: transaction.requestId || requestId,
        targetUserId: transaction.userId || null,
      },
    });

    // Return full sensitive fields only to admin (middleware ensures admin)
    return res.status(200).json({
      success: true,
      data: {
        id: transaction._id,
        userId: transaction.userId,
        requestId: transaction.requestId,
        transId: transaction.transId,
        telco: transaction.telco,
        code: transaction.code,
        serial: transaction.serial,
        declaredValue: transaction.declaredValue,
        cardValue: transaction.cardValue,
        amount: transaction.amount,
        status: transaction.status,
        message: transaction.message,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ getCardAudit error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// @desc    Buy cards from provider (user-facing)
// @route   POST /api/card/buy
// @access  Private (authenticated users)
export const buyCard = async (req, res) => {
  try {
    const { service_code, wallet_number, value, qty, request_id } = req.body;

    if (!service_code || !wallet_number || !value || !qty) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tham số mua thẻ" });
    }

    const config = await getPaymentConfig();

    const requestId =
      request_id && String(request_id).trim() !== ""
        ? String(request_id)
        : `${req.user.id}_${Date.now()}`;

    const command = "buycard";
    const sign = generateBuySign(
      config.partnerKey || "",
      config.partnerId || "",
      command,
      requestId
    );

    // Create purchase record (pending)
    const purchase = await CardPurchase.create({
      userId: req.user.id,
      requestId,
      serviceCode: service_code,
      walletNumber: wallet_number,
      value: Number(value),
      qty: Number(qty),
      status: 99,
      message: "PENDING",
    });

    // Build form data (application/x-www-form-urlencoded)
    const params = new URLSearchParams();
    params.append("partner_id", config.partnerId);
    params.append("command", command);
    params.append("request_id", requestId);
    params.append("service_code", service_code);
    params.append("wallet_number", wallet_number);
    params.append("value", String(value));
    params.append("qty", String(qty));
    params.append("sign", sign);

    try {
      const response = await axios.post(
        `https://${DOMAIN_POST}/api/cardws`,
        params.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 30000,
        }
      );

      // Update purchase with provider response
      purchase.transId =
        response.data && response.data.trans_id
          ? response.data.trans_id
          : purchase.transId;
      purchase.status =
        typeof response.data.status === "number"
          ? response.data.status
          : purchase.status;
      purchase.message = response.data.message || purchase.message;
      purchase.providerResponse = response.data;
      await purchase.save();

      // Log
      await createUserLog(req, {
        message: `Mua thẻ: request ${requestId} - service ${service_code}`,
        source: "backend",
        page: "/card/buy",
        meta: {
          type: "card_buy",
          requestId,
          service_code,
          wallet_number,
          value,
          qty,
          providerStatus: response.data.status,
        },
      });

      return res.status(200).json({ success: true, data: response.data });
    } catch (apiErr) {
      console.error("❌ Card buy API error:", apiErr?.message || apiErr);
      // Mark purchase failed
      purchase.status = 100;
      purchase.message = apiErr?.message || "Lỗi kết nối nhà cung cấp";
      purchase.providerResponse = apiErr?.response?.data || {
        error: apiErr?.message,
      };
      await purchase.save();

      await createUserLog(req, {
        message: `Lỗi mua thẻ: request ${requestId} - ${apiErr?.message}`,
        source: "backend",
        page: "/card/buy",
        meta: {
          type: "card_buy_error",
          requestId,
          error: apiErr?.message,
        },
      });

      return res.status(502).json({
        success: false,
        message: "Không thể kết nối tới nhà cung cấp mua thẻ",
        error: apiErr?.message,
        provider: apiErr?.response?.data || null,
      });
    }
  } catch (error) {
    console.error("❌ buyCard error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi mua thẻ",
      error: error.message,
    });
  }
};
