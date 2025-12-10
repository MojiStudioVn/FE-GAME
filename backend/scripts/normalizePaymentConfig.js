#!/usr/bin/env node
// Normalize PaymentConfig documents to ensure cardDiscount has all provider keys
// Usage: node scripts/normalizePaymentConfig.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import PaymentConfig from "../models/PaymentConfig.js";

const MONGO =
  process.env.MONGO_URI ||
  process.env.MONGO ||
  "mongodb://127.0.0.1:27017/yourdb";

const providers = [
  "VIETTEL",
  "MOBIFONE",
  "VINAPHONE",
  "ZING",
  "GATE",
  "GARENA",
];

async function run() {
  console.log("Connecting to", MONGO);
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    const configs = await PaymentConfig.find().exec();
    console.log("Found", configs.length, "payment config(s)");
    for (const cfg of configs) {
      let changed = false;
      if (!cfg.cardDiscount || typeof cfg.cardDiscount !== "object") {
        // if it's a number or something, convert to object with fallback
        const fallback =
          typeof cfg.cardDiscount === "number" ? cfg.cardDiscount : 70;
        cfg.cardDiscount = {};
        for (const p of providers) cfg.cardDiscount[p] = fallback;
        changed = true;
      } else {
        // ensure keys exist
        const existingValues = Object.values(cfg.cardDiscount).filter(
          (v) => typeof v === "number"
        );
        const fallback = existingValues.length ? existingValues[0] : 70;
        for (const p of providers) {
          if (typeof cfg.cardDiscount[p] === "undefined") {
            cfg.cardDiscount[p] = fallback;
            changed = true;
          }
        }
      }
      if (changed) {
        await cfg.save();
        console.log("Updated config", cfg._id);
      } else {
        console.log("No change for", cfg._id);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Done");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
