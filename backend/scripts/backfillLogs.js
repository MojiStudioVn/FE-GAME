import mongoose from "mongoose";
import Log from "../models/Log.js";
import CardTransaction from "../models/CardTransaction.js";
import { config } from "../config/env.js";

const maskSensitive = (str) => {
  try {
    if (!str || typeof str !== "string") return null;
    if (str.length <= 4) return "****";
    return "****" + str.slice(-4);
  } catch (e) {
    return null;
  }
};

const extractRequestIdFromMessage = (msg) => {
  if (!msg || typeof msg !== "string") return null;
  const m = msg.match(/request\s+([\w\-_]+)/i);
  return m ? m[1] : null;
};

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI, { keepAlive: true });
    console.log("Connected.");

    // 1) Backfill card logs missing masked values
    const cardLogs = await Log.find({
      $and: [
        {
          $or: [
            { "meta.type": /card/i },
            { message: /nạp thẻ|gửi thẻ|mua thẻ/i },
          ],
        },
        {
          $or: [
            { "meta.codeMasked": { $exists: false } },
            { "meta.serialMasked": { $exists: false } },
          ],
        },
      ],
    }).lean();

    console.log(`Found ${cardLogs.length} card-related logs to inspect`);

    for (const log of cardLogs) {
      try {
        const meta = log.meta || {};
        let requestId =
          meta.requestId || extractRequestIdFromMessage(log.message);

        if (!requestId && meta.request_id) requestId = meta.request_id;

        let tx = null;
        if (requestId) {
          tx = await CardTransaction.findOne({ requestId }).lean();
        }

        if (tx && (tx.code || tx.serial)) {
          const updates = {};
          if (!meta.codeMasked && tx.code)
            updates["meta.codeMasked"] = maskSensitive(tx.code);
          if (!meta.serialMasked && tx.serial)
            updates["meta.serialMasked"] = maskSensitive(tx.serial);

          if (Object.keys(updates).length) {
            await Log.updateOne({ _id: log._id }, { $set: updates });
            console.log(`Updated log ${log._id} with masked values`);
          }
        }
      } catch (e) {
        console.error(`Error processing log ${log._id}:`, e.message || e);
      }
    }

    // 2) Mark admin config update logs with actorRole = 'admin' if missing
    const cfgLogs = await Log.find({
      $and: [
        { message: /Cập nhật cấu hình/i },
        {
          $or: [
            { "meta.actorRole": { $exists: false } },
            { "meta.actorRole": null },
          ],
        },
      ],
    }).lean();

    console.log(`Found ${cfgLogs.length} config-update logs to tag as admin`);

    for (const log of cfgLogs) {
      try {
        await Log.updateOne(
          { _id: log._id },
          { $set: { "meta.actorRole": "admin" } }
        );
        console.log(`Tagged log ${log._id} as admin actor`);
      } catch (e) {
        console.error(`Error tagging log ${log._id}:`, e.message || e);
      }
    }

    console.log("Backfill completed.");
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(2);
  }
};

run();
