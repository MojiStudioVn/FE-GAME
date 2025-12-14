import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads/accounts");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "account-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload ảnh (jpeg, jpg, png, gif, webp)"));
  }
};

// Multer upload configuration
export const uploadAccountImages = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
}).array("images", 10); // Allow up to 10 images

// Multer middleware for account list files (.txt, .docx)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "accounts-file-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const accountFileFilter = (req, file, cb) => {
  const allowedExt = /\.txt$|\.docx$/i;
  if (allowedExt.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file .txt hoặc .docx"));
  }
};

export const uploadAccountFile = multer({
  storage: fileStorage,
  // Increased limit to 50MB to allow larger account list files.
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: accountFileFilter,
}).single("file");
