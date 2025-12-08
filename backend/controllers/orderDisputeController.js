import OrderDispute from "../models/OrderDispute.js";
import AccountListing from "../models/AccountListing.js";
import AdminLog from "../models/AdminLog.js";
import User from "../models/User.js";

// Create a dispute
export const createDispute = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const buyerId = req.user.id;
    const order = await AccountListing.findById(orderId);
    if (!order || !order.soldTo) {
      return res.status(404).json({ success: false, message: "Order not found or not sold." });
    }
    const dispute = await OrderDispute.create({
      orderId,
      buyerId,
      sellerId: order.uploadedBy,
      reason,
    });
    res.status(201).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating dispute", error: error.message });
  }
};

// Admin resolve dispute (refund/release)
export const resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { action, adminNote } = req.body;
    const dispute = await OrderDispute.findById(disputeId);
    if (!dispute || dispute.status !== "pending") {
      return res.status(404).json({ success: false, message: "Dispute not found or already resolved." });
    }
    let statusUpdate = "pending";
    if (action === "refund") statusUpdate = "refunded";
    else if (action === "release") statusUpdate = "released";
    else if (action === "reject") statusUpdate = "rejected";
    dispute.status = statusUpdate;
    dispute.adminAction = action;
    dispute.adminNote = adminNote || "";
    dispute.resolvedAt = new Date();
    await dispute.save();
    // Log admin action
    await AdminLog.create({
      adminId: req.user.id,
      action: `dispute_${action}`,
      details: `Dispute ${disputeId} ${action}`,
      metadata: { disputeId, orderId: dispute.orderId, adminNote },
      ipAddress: req.ip,
    });
    res.status(200).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error resolving dispute", error: error.message });
  }
};

// Get disputes (admin)
export const getDisputes = async (req, res) => {
  try {
    const disputes = await OrderDispute.find().sort({ createdAt: -1 }).populate("orderId buyerId sellerId");
    res.status(200).json({ success: true, disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching disputes", error: error.message });
  }
};
