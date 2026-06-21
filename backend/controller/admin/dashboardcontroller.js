const User = require("../../model/usermodel");
const Payment = require("../../model/payment");
const Image = require("../../model/image");
const Code = require("../../model/code");
const Website = require("../../model/website");
const Resume = require("../../model/resume");
const Youtube = require("../../model/youtubesummary");
const MockAI = require("../../model/mockai");
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 mins

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PLAN_COLORS = {
  free: "#8b5cf6",
  pro: "#3b82f6",
  premium: "#10b981",
};

function getLastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      month: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    };
  });
}

function fillMonthlySeries(months, rows, valueKey) {
  const map = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row[valueKey] || 0]));
  return months.map((month) => ({
    month: month.month,
    [valueKey]: map.get(month.key) || 0,
  }));
}

async function countMonthly(model, dateField, months) {
  return model.aggregate([
    { $match: { [dateField]: { $gte: months[0].start, $lt: months[months.length - 1].end } } },
    {
      $group: {
        _id: { year: { $year: `$${dateField}` }, month: { $month: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
}

exports.getDashboardStats = async (req, res) => {
  try {
    const cachedData = myCache.get("adminStats");
    if (cachedData) return res.json(cachedData);
    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
      lastlogin: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: {
            $gte: new Date(new Date().setDate(1)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalAIRequests =
      (await Image.countDocuments()) +
      (await Code.countDocuments()) +
      (await Website.countDocuments()) +
      (await Resume.countDocuments()) +
      (await MockAI.countDocuments()) +
      (await Youtube.countDocuments());

    const months = getLastSixMonths();
    const userRows = await countMonthly(User, "createdAt", months);
    const userGrowthData = fillMonthlySeries(months, userRows, "count").map((row) => ({
      month: row.month,
      users: row.count,
    }));

    const revenueRows = await Payment.aggregate([
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
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const revenueData = fillMonthlySeries(months, revenueRows, "revenue");

    const aiMonthlyRows = await Promise.all([
      countMonthly(Image, "createdAt", months),
      countMonthly(Code, "createdAt", months),
      countMonthly(Website, "createdAt", months),
      countMonthly(Resume, "createdAt", months),
      countMonthly(Youtube, "createdAt", months),
      countMonthly(MockAI, "startedAt", months),
    ]);

    const aiRequestMap = new Map(months.map((month) => [month.key, 0]));
    aiMonthlyRows.flat().forEach((row) => {
      const key = `${row._id.year}-${row._id.month}`;
      aiRequestMap.set(key, (aiRequestMap.get(key) || 0) + (row.count || 0));
    });
    const aiRequestData = months.map((month) => ({
      month: month.month,
      requests: aiRequestMap.get(month.key) || 0,
    }));

    const planDistributionRows = await User.aggregate([
      { $group: { _id: "$subscription", value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const planDistributionData = planDistributionRows.map((row) => ({
      name: row._id || "free",
      value: row.value,
      color: PLAN_COLORS[row._id] || "#64748b",
    }));

    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(4).select("name email subscription createdAt").lean();
    const recentPaid = await Payment.find({ status: "paid" }).sort({ createdAt: -1 }).limit(4).populate("user", "name").lean();
    const recentActivities = [
      ...latestUsers.map((user) => ({
        user: user.name || user.email || "User",
        action: "New user signup",
        time: user.createdAt,
        type: "signup",
      })),
      ...recentPaid.map((payment) => ({
        user: payment.user?.name || "User",
        action: `Upgraded to ${payment.plan} plan`,
        time: payment.createdAt,
        type: "upgrade",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    const responseData = {
      totalUsers,
      activeUsers,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalAIRequests,
      userGrowthData,
      revenueData,
      aiRequestData,
      planDistributionData,
      recentActivities,
    };

    myCache.set("adminStats", responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
