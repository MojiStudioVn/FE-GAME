#!/usr/bin/env node
// Script: checkAccountTypeCounts.js
// Usage: from the backend folder run `node scripts/checkAccountTypeCounts.js`
// Reads `MONGODB_URI` from environment (or uses a localhost default).

const path = require("path");
const mongoose = require("mongoose");

// load .env if present
try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
} catch (e) {}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/5m";

const AccountListing = require(path.join(
  __dirname,
  "..",
  "models",
  "AccountListing"
));

async function main() {
  console.log("Connecting to DB:", uri);
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const randomCount = await AccountListing.countDocuments({
    accountType: "random",
  });
  const checkedCount = await AccountListing.countDocuments({
    accountType: "checked",
  });
  const checkedAccountCount = await AccountListing.countDocuments({
    accountType: "checked-account",
  });

  console.log("--- Account type counts ---");
  console.log("accountType = random          :", randomCount);
  console.log("accountType = checked         :", checkedCount);
  console.log("accountType = checked-account :", checkedAccountCount);
  console.log(
    "combined (checked + checked-account):",
    checkedCount + checkedAccountCount
  );

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
