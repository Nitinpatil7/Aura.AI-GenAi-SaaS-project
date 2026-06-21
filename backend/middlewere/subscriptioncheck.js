const User = require("../model/usermodel");

const plans = [
  {
    name: "free",
    features: {
      image: 3,
      code: 5,
      website: 1,
      resume: 1,
      youtube: 5,
      interview: 1,
      chat: Infinity,
    },
  },
  {
    name: "pro",
    features: {
      image: 50,
      code: 50,
      website: 15,
      resume: Infinity,
      youtube: Infinity,
      interview: 5,
      chat: Infinity,
    },
  },
  {
    name: "premium",
    features: {
      image: Infinity,
      code: Infinity,
      website: Infinity,
      resume: Infinity,
      youtube: Infinity,
      interview: Infinity,
      chat: Infinity,
    },
  },
];

const checkplan = (feature) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await User.findById(req.user.id);
      
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      if (user.isblocked)
        return res.status(403).json({ message: "User blocked" });

      const now = new Date();
      if (
        user.subscription !== "free" &&
        user.subscriptionEnd &&
        user.subscriptionEnd < now
      ) {
        user.subscription = "free";
        user.usage = {
          image: 0,
          code: 0,
          website: 0,
          resume: 0,
          youtube: 0,
          interview: 0,
          chat: 0,
        };
        await user.save();
      }

       if (!user.usageResetDate) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        user.usageResetDate = nextMonth;
        await user.save();
      }

      if (user.usageResetDate < now) {
        user.usage = {
          image: 0,
          code: 0,
          website: 0,
          resume: 0,
          youtube: 0,
          interview: 0,
          chat: 0,
        };

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        user.usageResetDate = nextMonth;

        await user.save();
      }
       const userPlan = user.subscription || "free";

const plan = plans.find((p) => p.name === userPlan);

if (!plan) {
  return res.status(400).json({ message: "Invalid plan" });
}

const limit = plan.features[feature];
      const used = user.usage?.[feature] || 0;

      if (used >= limit) {
        return res.status(403).json({
                  message: `${feature} quota exceeded for ${userPlan} plan`,

        });
      }
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkplan;
