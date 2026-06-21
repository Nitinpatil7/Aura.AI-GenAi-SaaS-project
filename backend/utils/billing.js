const Payment = require("../model/payment");

const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 499, yearly: 4999 },
  premium: { monthly: 899, yearly: 9999 },
};

function addBillingPeriod(startDate, billingcycle) {
  const endDate = new Date(startDate);
  if (billingcycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
}

function getPlanPrice(plan, billingcycle) {
  return PLAN_PRICES[plan]?.[billingcycle] || 0;
}

function getBillingStatus(user) {
  if (!user || user.subscription === "free") return "free";
  if (!user.subscriptionEnd) return "active";
  return user.subscriptionEnd > new Date() ? "active" : "expired";
}

async function getBillingDetails(user) {
  const latestPayment = await Payment.findOne({
    user: user._id,
    status: "paid",
  })
    .sort({ createdAt: -1 })
    .lean();

  const billingcycle = latestPayment?.billingcycle || "monthly";
  const amount = latestPayment?.amount ?? getPlanPrice(user.subscription || "free", billingcycle);
  const status = getBillingStatus(user);
  const now = new Date();
  const daysRemaining =
    user.subscriptionEnd && user.subscriptionEnd > now
      ? Math.ceil((user.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  return {
    plan: user.subscription || "free",
    status,
    billingcycle,
    amount,
    currency: "INR",
    startDate: user.subscriptionStart || latestPayment?.createdAt || user.createdAt,
    endDate: user.subscriptionEnd || null,
    nextBillingDate: status === "active" ? user.subscriptionEnd || null : null,
    daysRemaining,
    usageResetDate: user.usageResetDate || null,
    latestPayment: latestPayment
      ? {
          amount: latestPayment.amount,
          billingcycle: latestPayment.billingcycle,
          status: latestPayment.status,
          paidAt: latestPayment.createdAt,
          razorpayPaymentId: latestPayment.razorpayPaymentId || "",
        }
      : null,
  };
}

module.exports = {
  addBillingPeriod,
  getBillingDetails,
  getPlanPrice,
  PLAN_PRICES,
};
