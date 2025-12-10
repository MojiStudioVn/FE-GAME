import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  getMyDashboard,
  updateProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { validate } from "../middleware/validator.js";

const router = express.Router();

// Register validation
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Tên người dùng phải từ 3-30 ký tự"),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
];

// Login validation
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập email hoặc tên người dùng"),
  body("password").notEmpty().withMessage("Vui lòng nhập mật khẩu"),
];

// Profile update validation
const profileUpdateValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Tên người dùng phải từ 3-30 ký tự"),
  body("avatar").optional().isString().withMessage("Avatar phải là chuỗi"),
];

// Routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", verifyToken, getMe);
router.get("/me/dashboard", verifyToken, getMyDashboard);
router.put(
  "/profile",
  verifyToken,
  profileUpdateValidation,
  validate,
  updateProfile
);

export default router;
