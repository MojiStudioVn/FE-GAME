import crypto from "crypto";
import axios from "axios";
import CardTransaction from "../models/CardTransaction.js";
import User from "../models/User.js";
import Log from "../models/Log.js";
import PaymentConfig from "../models/PaymentConfig.js";

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

    // Validate telco
    if (!["VIETTEL", "MOBIFONE", "VINAPHONE"].includes(telco)) {
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

      // Update transaction with response
      transaction.transId = response.data.trans_id;
      transaction.status = response.data.status;
      transaction.message = response.data.message;
      await transaction.save();

      // Create log
      await Log.create({
        action: "charge_card",
        userId: req.user.id,
        userName: req.user.username,
        userEmail: req.user.email,
        meta: {
          type: "card_charge",
          requestId,
          telco,
          declaredValue: amount,
          status: response.data.status,
        },
      });

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
    } = req.body;

    console.log("📥 Card callback received:", req.body);

    // Get payment config
    const config = await getPaymentConfig();

    // Verify signature
    const expectedSign = generateSign(config.partnerKey, code, serial);
    if (callback_sign !== expectedSign) {
      console.error("❌ Invalid callback signature");
      return res.status(403).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find transaction
    const transaction = await CardTransaction.findOne({
      requestId: request_id,
    });

    if (!transaction) {
      console.error("❌ Transaction not found:", request_id);
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction
    transaction.status = status;
    transaction.message = message;
    transaction.transId = trans_id;
    transaction.declaredValue = declared_value;
    transaction.cardValue = card_value || value;
    transaction.value = value;
    transaction.amount = amount;
    transaction.callbackSign = callback_sign;
    await transaction.save();

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
        await Log.create({
          action: "card_success",
          userId: user._id,
          userName: user.username,
          userEmail: user.email,
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
      await Log.create({
        action: "card_error",
        userId: transaction.userId,
        userName: "",
        userEmail: "",
        meta: {
          type: "card_error",
          requestId: request_id,
          transId: trans_id,
          telco,
          code,
          serial,
          message,
        },
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

    res.status(200).json({
      success: true,
      data: transactions,
      stats,
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
