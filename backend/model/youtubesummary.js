const mongoose = require("mongoose");

const youtubeSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  videoDetails: {
    title: String,
    description: String,
    thumbnail: String,
    channel: String,
    publishedAt: String,
  },
  aiSummary: {
    quickSummary: String,
    keyPoints: [String],
    importantQuotes: [String],
    fullTranscript: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("YouTube", youtubeSummarySchema);