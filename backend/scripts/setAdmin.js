import mongoose from "mongoose";
import User from "../models/User.js";
import { config } from "../config/env.js";

const setUserAsAdmin = async (usernameOrEmail) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      console.log("❌ User not found:", usernameOrEmail);
      process.exit(1);
    }

    // Update user role to admin
    user.role = "admin";
    await user.save();

    console.log("✅ User set as admin successfully!");
    console.log("   Username:", user.username);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

// Get username/email from command line argument
const usernameOrEmail = process.argv[2];

if (!usernameOrEmail) {
  console.log("Usage: node setAdmin.js <username-or-email>");
  console.log("Example: node setAdmin.js admin");
  process.exit(1);
}

setUserAsAdmin(usernameOrEmail);
