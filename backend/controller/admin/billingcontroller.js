const Payment = require("../../model/payment");
const User = require("../../model/usermodel");

exports.getBillingStats = async (req, res) => {
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      month: `${monthLabels[date.getMonth()]} ${date.getFullYear()}`,
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    };
  });

  const revenue = await Payment.aggregate([
    {
      $match: { status: "paid" }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" }
      }
    }
  ]);

  const failedPayments = await Payment.countDocuments({
    status: "failed"
  });



  const transactions = await Payment.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("user","name email subscription subscriptionStart subscriptionEnd");

    const activesubscription = await User.countDocuments({
      subscription:{$in:["pro","premium"]}
    })

    const average = await Payment.aggregate([
      {
        $match: { status: "paid" } 
      },
      {
        $group: {
          _id: null,
          averageAmount: { $avg: "$amount" }
        }
      }
    ]);

    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: months[0].start, $lt: months[months.length - 1].end },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
          subscriptions: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyMap = new Map(
      monthlyPayments.map((row) => [`${row._id.year}-${row._id.month}`, row]),
    );
    const revenueData = months.map((month) => {
      const row = monthlyMap.get(month.key);
      return {
        month: month.month,
        revenue: row?.revenue || 0,
        subscriptions: row?.subscriptions || 0,
      };
    });

    const planColors = { pro: "#3b82f6", premium: "#10b981" };
    const planRevenueData = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$plan", revenue: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);

    const retentionData = await Promise.all(
      months.map(async (month) => {
        const retained = await User.countDocuments({
          subscription: { $in: ["pro", "premium"] },
          subscriptionStart: { $lt: month.end },
          subscriptionEnd: { $gte: month.start },
        });
        const churned = await User.countDocuments({
          subscriptionEnd: { $gte: month.start, $lt: month.end },
        });

        return {
          month: month.month,
          retained,
          churned,
        };
      }),
    );

    const activeSubscriptions = await User.find({
      subscription: { $in: ["pro", "premium"] },
    })
      .sort({ subscriptionEnd: 1, name: 1 })
      .limit(10)
      .select("name email subscription subscriptionStart subscriptionEnd")
      .lean();

  res.json({
    totalRevenue: revenue[0]?.totalRevenue || 0,
    failedPayments,
    transactions,
    activesubscription,
    averageAmount: average[0]?.averageAmount || 0,
    revenueData,
    planRevenueData: planRevenueData.map((row) => ({
      name: row._id || "unknown",
      revenue: row.revenue || 0,
      color: planColors[row._id] || "#64748b",
    })),
    retentionData,
    activeSubscriptions
  

  });

};
