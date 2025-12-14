import mongoose from "mongoose";

const accountListingSchema = new mongoose.Schema(
  {
    // Account credentials
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Account details
    images: [
      {
        type: String, // URLs to uploaded images
      },
    ],
    heroes: [
      {
        type: String,
        trim: true,
      },
    ],
    skins: [
      {
        type: String,
        trim: true,
      },
    ],
    ssCards: [
      {
        type: String,
        trim: true,
      },
    ],
    sssCards: [
      {
        type: String,
        trim: true,
      },
    ],
    level: {
      type: Number,
      default: 1,
    },
    rank: {
      type: String,
      default: "Unranked",
      trim: true,
    },
    country: {
      type: String,
      default: "Vietnam",
      trim: true,
    },
    // Additional parsed metadata from uploads
    displayName: {
      type: String,
      trim: true,
    },
    heroesCount: {
      type: Number,
      default: 0,
    },
    skinsCount: {
      type: Number,
      default: 0,
    },
    qh: {
      type: Number,
      default: 0,
    },
    soCount: {
      type: Number,
      default: 0,
    },
    createdAtOriginal: {
      type: String,
    },
    lsnap: {
      type: String,
    },
    lastPasswordChange: {
      type: String,
    },
    lastPhoneChange: {
      type: String,
    },
    hasCmnd: {
      type: Boolean,
      default: false,
    },
    hasEmail: {
      type: Boolean,
      default: false,
    },
    emailStatus: {
      type: String,
      default: "",
    },
    hasAuthen: {
      type: Boolean,
      default: false,
    },
    hasPhone: {
      type: Boolean,
      default: false,
    },
    fbStatus: {
      type: String,
      default: "",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    ssCount: {
      type: Number,
      default: 0,
    },
    sssCount: {
      type: Number,
      default: 0,
    },
    animeCount: {
      type: Number,
      default: 0,
    },
    sssAndAnime: {
      type: String,
      default: "",
    },
    accountState: {
      type: String,
      default: "",
    },

    // Sale information
    saleType: {
      type: String,
      enum: ["fixed", "auction"],
      required: true,
      default: "fixed",
    },

    // Fixed price
    price: {
      type: Number,
      default: 0,
    },

    // Auction details
    auctionStartPrice: {
      type: Number,
      default: 0,
    },
    auctionStepPrice: {
      type: Number,
      default: 0,
    },
    auctionDuration: {
      type: Number, // in hours
      default: 24,
    },
    auctionEndTime: {
      type: Date,
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bidHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Description
    description: {
      type: String,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: ["active", "sold", "expired", "removed"],
      default: "active",
    },
    // Account upload type: random vs checked (accept both 'checked' and 'checked-account')
    accountType: {
      type: String,
      enum: ["random", "checked-account", "checked"],
      default: "random",
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    soldAt: {
      type: Date,
    },

    // Metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
accountListingSchema.index({ status: 1, saleType: 1 });
accountListingSchema.index({ auctionEndTime: 1 });

const AccountListing = mongoose.model("AccountListing", accountListingSchema);

export default AccountListing;
