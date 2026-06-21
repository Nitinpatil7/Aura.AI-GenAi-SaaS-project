const razorpay = require("../config/razorpay");
const Payment = require("../model/payment");
const User = require("../model/usermodel");
const crypto = require("crypto");
const { addBillingPeriod, getBillingDetails } = require("../utils/billing");

const prices = {
  pro: {
    monthly: 499,
    yearly: 4999,
  },
  premium: {
    monthly: 899,
    yearly: 9999,
  },
};
exports.createorder = async (req, res) => {
  try {
    const { plan, billingcycle } = req.body;

    if (!plan || !billingcycle) {
  return res.status(400).json({
    message: "Plan and billing cycle required",
  });
}

if (!prices[plan] || !prices[plan][billingcycle]) {
  return res.status(400).json({
    message: "Invalid plan or billing cycle",
  });
}
    const amount = prices[plan][billingcycle];

    if (!amount) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user.id,
      plan,
      billingcycle,
      amount,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Order creation failed",
    });
  }
};

exports.verifypayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    await payment.save();

    const user = await User.findById(req.user.id);

    const startDate = new Date();
    const endDate = addBillingPeriod(startDate, payment.billingcycle);

    user.subscription = payment.plan;
    user.subscriptionStart = startDate;
    user.subscriptionEnd = endDate;

    await user.save();

    res.json({
      success: true,
      message: "Payment successful",
      billingDetails: await getBillingDetails(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
