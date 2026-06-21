// models/imageHistory.js
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    style: { type: String },
    aspect: { type: String },
    images: { type: [String], required: true },
  },
  { timestamps: true }
);

imageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Image", imageSchema);