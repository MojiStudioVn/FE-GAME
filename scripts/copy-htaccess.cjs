const fs = require("fs");
const path = require("path");

function copy() {
  try {
    const repoRoot = path.resolve(__dirname, "..");
    const src = path.join(repoRoot, "deploy", ".htaccess");
    const destDir = path.join(repoRoot, "dist");
    const dest = path.join(destDir, ".htaccess");

    if (!fs.existsSync(src)) {
      console.warn("deploy/.htaccess not found — skipping copy");
      return;
    }

    if (!fs.existsSync(destDir)) {
      console.warn(
        "dist/ folder not found — build may have failed; skipping copy"
      );
      return;
    }

    fs.copyFileSync(src, dest);
    console.log("Copied deploy/.htaccess to dist/.htaccess");
  } catch (err) {
    console.error("Failed to copy .htaccess:", err);
    process.exitCode = 1;
  }
}

copy();
