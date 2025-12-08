import cron from "node-cron";
import { autoCleanupSoldAccounts } from "../controllers/accountListingController.js";

/**
 * Account Cleanup Scheduler
 * Runs every day at 2:00 AM to clean up sold accounts older than 24 hours
 */
export const startAccountCleanupScheduler = () => {
  // Run every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("🧹 Running scheduled account cleanup...");
    try {
      const deletedCount = await autoCleanupSoldAccounts();
      console.log(
        `✅ Scheduled cleanup completed: ${deletedCount} accounts deleted`
      );
    } catch (error) {
      console.error("❌ Scheduled cleanup failed:", error);
    }
  });

  console.log("⏰ Account cleanup scheduler started (runs daily at 2:00 AM)");
};
