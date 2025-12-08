import mongoose from "mongoose";
import User from "../models/User.js";
import { config } from "../config/env.js";

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all users
    const users = await User.find().select("username email role coins").lean();

    console.log("📋 List of users:");
    console.log("─".repeat(80));
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Coins: ${user.coins}`);
      console.log("─".repeat(80));
    });

    console.log(`\nTotal users: ${users.length}`);
    console.log(
      "\nTo set a user as admin, run: node scripts/setAdmin.js <username>"
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

listUsers();
