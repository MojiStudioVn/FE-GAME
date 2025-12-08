import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env file
dotenv.config({ path: path.join(__dirname, "../.env") });

// Validate required environment variables
const validateEnv = () => {
  const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
  const missingEnvVars = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Thiếu biến môi trường bắt buộc: ${missingEnvVars.join(", ")}\n` +
        "Vui lòng kiểm tra tệp .env của bạn và đảm bảo tất cả các biến cần thiết đã được thiết lập."
    );
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(
      "⚠️  CẢNH BÁO: JWT_SECRET quá ngắn. Sử dụng ít nhất 32 ký tự để đảm bảo an toàn."
    );
  }

  return {
    PORT: parseInt(process.env.PORT || "5000", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  };
};

// Export validated config
export const config = validateEnv();

// Log configuration (hide sensitive data)
console.log("✅ Biến môi trường đã được tải thành công");
console.log(`📦 Môi trường: ${config.NODE_ENV}`);
console.log(
  `🗄️  MongoDB: ${config.MONGODB_URI.replace(/\/\/.*@/, "//*****@")}`
);
console.log(`🌐 URL Client: ${config.CLIENT_URL}`);
