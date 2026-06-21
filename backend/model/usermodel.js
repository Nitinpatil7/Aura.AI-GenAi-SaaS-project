const mongoose = require("mongoose");

const userschema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: Number, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isblocked: {
      type: Boolean,
      default: false,
    },
    subscription: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    subscriptionStart: Date,
    subscriptionEnd: Date,
    usageResetDate: Date,
    usage: {
      image: { type: Number, default: 0 },
      code: { type: Number, default: 0 },
      website: { type: Number, default: 0 },
      resume: { type: Number, default: 0 },
      youtube: { type: Number, default: 0 },
      interview: { type: Number, default: 0 }, // daily count reset daily
      chat: { type: Number, default: 0 },
    },

    lastlogin: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userschema);
