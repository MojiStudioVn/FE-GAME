import mongoose from "mongoose";

const shortenedLinkSchema = new mongoose.Schema(
  {
    // User who created the link
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional if admin creates
    },

    // Admin who created the link
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional if user creates
    },

    // Provider information
    provider: {
      type: String,
      required: true,
      enum: [
        "site2s",
        "funlink",
        "linktop",
        "link4m",
        "yeulink",
        "yeumoney",
        "linkngon_com",
        "linkngon_net",
        "linkngon_io",
        "4mmo",
        "bbmkts",
        "uptolink",
      ],
    },

    providerDomain: {
      type: String,
      required: true,
    },

    // URL information
    originalUrl: {
      type: String,
      required: true,
    },

    shortenedUrl: {
      type: String,
      required: true,
    },

    slug: {
      type: String, // The short code (e.g., "DHS3DCM" from funlink.io/DHS3DCM)
      required: false,
    },

    customAlias: {
      type: String, // Custom alias if provided
      required: false,
    },

    // Statistics
    clicks: {
      type: Number,
      default: 0,
    },

    // Provider-specific data
    metadata: {
      remaining: Number, // For FunLink - remaining quota
      campaignType: Number, // For UpToLink - campaign type
      adType: Number, // For Site2S - ad type
      backupUrl: String, // For BBMkts - backup link
      // Add more as needed
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "deleted"],
      default: "active",
    },

    // Expiration
    expiresAt: {
      type: Date,
      required: false,
    },

    // Last checked (for verification)
    lastChecked: {
      type: Date,
      default: Date.now,
    },

    // IP address of creator (hashed for privacy)
    creatorIP: {
      type: String,
      required: false,
    },

    // Notes
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for performance
shortenedLinkSchema.index({ userId: 1, createdAt: -1 });
shortenedLinkSchema.index({ adminId: 1, createdAt: -1 });
shortenedLinkSchema.index({ provider: 1, status: 1 });
shortenedLinkSchema.index({ shortenedUrl: 1 }, { unique: true });
shortenedLinkSchema.index({ slug: 1 });
shortenedLinkSchema.index({ expiresAt: 1 });

// Virtual for checking if link is expired
shortenedLinkSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

const ShortenedLink = mongoose.model("ShortenedLink", shortenedLinkSchema);

export default ShortenedLink;
