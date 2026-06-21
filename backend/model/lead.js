const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["freelance", "internship"],
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    phone: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    ownerName: { type: String, trim: true, default: "" },
    hrName: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "" },
    hasWebsite: { type: Boolean, default: false },
    websiteQuality: {
      type: String,
      enum: ["", "none", "poor", "average", "good", "excellent"],
      default: "",
    },
    status: {
      type: String,
      enum: [
        "new",
        "message_generated",
        "draft_created",
        "sent",
        "replied",
        "follow_up_needed",
        "converted",
        "rejected",
      ],
      default: "new",
      index: true,
    },
    message: { type: String, trim: true, default: "" },
    lastContactedAt: { type: Date, default: null },
    nextFollowUpAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

leadSchema.index({
  companyName: "text",
  category: "text",
  city: "text",
  country: "text",
  email: "text",
  ownerName: "text",
  hrName: "text",
  source: "text",
});

module.exports = mongoose.model("Lead", leadSchema);
