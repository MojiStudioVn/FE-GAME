import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    console.log(`✅ MongoDB Kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error.message);
    console.warn(
      "⚠️  Server sẽ chạy nhưng các chức năng database sẽ không hoạt động."
    );
    console.warn("💡 Để sử dụng đầy đủ chức năng, vui lòng:");
    console.warn("   1. Cài đặt MongoDB local, hoặc");
    console.warn("   2. Sử dụng MongoDB Atlas (cloud)");
  }
};
