#!/usr/bin/env node
// Script: checkAccountTypeCounts.cjs
// Usage: from the backend folder run `node scripts/checkAccountTypeCounts.cjs`
// Reads `MONGODB_URI` from environment (or uses a localhost default).

const path = require("path");
const mongoose = require("mongoose");

// load .env if present
try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
} catch (e) {}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/5m";

let AccountListing = require(path.join(
  __dirname,
  "..",
  "models",
  "AccountListing"
));

// If the model file is an ES module with a default export, unwrap it
if (AccountListing && AccountListing.default) {
  AccountListing = AccountListing.default;
}

async function main() {
  console.log("Connecting to DB:", uri);
  await mongoose.connect(uri);

  const randomCount = await AccountListing.countDocuments({
    accountType: "random",
  });
  const checkedCount = await AccountListing.countDocuments({
    accountType: "checked",
  });
  const checkedAccountCount = await AccountListing.countDocuments({
    accountType: "checked-account",
  });

  // Counts restricted to active status
  const randomActive = await AccountListing.countDocuments({
    accountType: "random",
    status: "active",
  });
  const checkedActive = await AccountListing.countDocuments({
    accountType: "checked",
    status: "active",
  });
  const checkedAccountActive = await AccountListing.countDocuments({
    accountType: "checked-account",
    status: "active",
  });

  // Counts where ssCards/sssCards arrays are non-empty (fast check using index 0)
  const randomWithSSCards = await AccountListing.countDocuments({
    accountType: "random",
    "ssCards.0": { $exists: true },
  });
  const checkedAccountWithSSSCards = await AccountListing.countDocuments({
    accountType: { $in: ["checked-account", "checked"] },
    "sssCards.0": { $exists: true },
  });

  // Sample documents (random accountType=random) for inspection
  const sampleRandom = await AccountListing.find({ accountType: "random" })
    .limit(10)
    .select("username accountType price status ssCards sssCards")
    .lean();

  console.log("--- Account type counts ---");
  console.log("accountType = random          :", randomCount);
  console.log("accountType = checked         :", checkedCount);
  console.log("accountType = checked-account :", checkedAccountCount);
  console.log(
    "combined (checked + checked-account):",
    checkedCount + checkedAccountCount
  );

  console.log('\n--- Active counts (status: "active") ---');
  console.log("accountType = random (active)          :", randomActive);
  console.log("accountType = checked (active)         :", checkedActive);
  console.log("accountType = checked-account (active) :", checkedAccountActive);

  console.log("\n--- Non-empty cards counts ---");
  console.log("random with non-empty ssCards       :", randomWithSSCards);
  console.log(
    "checked/checked-account with sssCards:",
    checkedAccountWithSSSCards
  );

  console.log("\n--- Sample `random` documents (up to 10) ---");
  sampleRandom.forEach((d, i) => {
    const ssLen = Array.isArray(d.ssCards) ? d.ssCards.length : 0;
    const sssLen = Array.isArray(d.sssCards) ? d.sssCards.length : 0;
    console.log(
      `${i + 1}. user=${d.username} type=${d.accountType} status=${
        d.status
      } price=${d.price} ssCards=${ssLen} sssCards=${sssLen}`
    );
  });

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
