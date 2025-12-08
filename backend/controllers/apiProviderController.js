import APIProvider from "../models/APIProvider.js";
import AdminLog from "../models/AdminLog.js";

// Get all API providers
export const getProviders = async (req, res) => {
  try {
    const providers = await APIProvider.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhà cung cấp",
    });
  }
};

// Add new API provider
export const addProvider = async (req, res) => {
  try {
    const { provider, apiKey, apiUrl } = req.body;

    // Validate required fields
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn nhà cung cấp và nhập API Key",
      });
    }

    // Check if provider already exists
    const existingProvider = await APIProvider.findOne({ provider });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: "Nhà cung cấp này đã được thêm",
      });
    }

    // Create new provider
    const newProvider = await APIProvider.create({
      provider,
      apiKey,
      apiUrl: apiUrl || "",
      addedBy: req.admin?._id || req.user?._id || null,
    });

    // Log action
    if (req.admin?._id) {
      await AdminLog.create({
        adminId: req.admin._id,
        action: "add_api_provider",
        details: `Thêm nhà cung cấp API: ${provider}`,
        metadata: { provider },
      });
    }

    res.status(201).json({
      success: true,
      message: "Thêm nhà cung cấp thành công",
      provider: newProvider,
    });
  } catch (error) {
    console.error("Error adding provider:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm nhà cung cấp",
    });
  }
};

// Update API provider
export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey, apiUrl, status } = req.body;

    const provider = await APIProvider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà cung cấp",
      });
    }

    // Update fields
    if (apiKey) provider.apiKey = apiKey;
    if (apiUrl !== undefined) provider.apiUrl = apiUrl;
    if (status) provider.status = status;

    await provider.save();

    // Log action
    if (req.admin?._id) {
      await AdminLog.create({
        adminId: req.admin._id,
        action: "update_api_provider",
        details: `Cập nhật nhà cung cấp API: ${provider.provider}`,
        metadata: { provider: provider.provider },
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật nhà cung cấp thành công",
      provider: provider,
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật nhà cung cấp",
    });
  }
};

// Delete API provider
export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await APIProvider.findByIdAndDelete(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà cung cấp",
      });
    }

    // Log action
    if (req.admin?._id) {
      await AdminLog.create({
        adminId: req.admin._id,
        action: "delete_api_provider",
        details: `Xóa nhà cung cấp API: ${provider.provider}`,
        metadata: { provider: provider.provider },
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa nhà cung cấp thành công",
    });
  } catch (error) {
    console.error("Error deleting provider:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nhà cung cấp",
    });
  }
};
