const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  plan: {
    type: String,
    enum: ["pro", "premium"],
  },

  amount: Number,
  billingcycle: {
    type: String,
    enum: ["monthly", "yearly"],
  },

  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);