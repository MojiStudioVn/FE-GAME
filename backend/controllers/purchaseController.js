import Purchase from "../models/Purchase.js";

export const getPurchaseById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    const purchase = await Purchase.findById(id).lean();
    if (!purchase)
      return res.status(404).json({ success: false, message: "Not found" });

    const userId = req.user?.id || req.user?._id;
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && String(purchase.buyerId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Return account snapshot (may include password) only to the buyer or admin
    return res.json({ success: true, purchase });
  } catch (err) {
    console.error("getPurchaseById error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { getPurchaseById };
