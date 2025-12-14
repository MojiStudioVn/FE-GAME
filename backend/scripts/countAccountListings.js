#!/usr/bin/env node
import { connectDB } from "../config/database.js";
import AccountListing from "../models/AccountListing.js";

const run = async () => {
  await connectDB();

  const total = await AccountListing.countDocuments();
  console.log(`✅ Total account listings: ${total}`);

  const bySaleType = await AccountListing.aggregate([
    { $group: { _id: "$saleType", count: { $sum: 1 } } },
  ]);
  console.log("📊 Count by saleType:", bySaleType);

  const byStatus = await AccountListing.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  console.log("📌 Count by status:", byStatus);

  // Count listings that include ssCards / sssCards (useful to detect tiers)
  const withSS = await AccountListing.countDocuments({
    ssCards: { $exists: true, $ne: [] },
  });
  const withSSS = await AccountListing.countDocuments({
    sssCards: { $exists: true, $ne: [] },
  });
  console.log(`🔎 Listings with ssCards: ${withSS}`);
  console.log(`🔎 Listings with sssCards: ${withSSS}`);

  // Show a few sample documents to inspect type fields
  const sample = await AccountListing.find(
    {},
    { username: 1, saleType: 1, status: 1, price: 1, ssCards: 1, sssCards: 1 }
  )
    .limit(10)
    .lean();
  console.log("🧾 Sample documents (up to 10):");
  console.log(JSON.stringify(sample, null, 2));

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error running count script:", err);
  process.exit(1);
});
