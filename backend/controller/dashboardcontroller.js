const Image = require("../model/image");
const User = require("../model/usermodel");
const Website = require("../model/website");
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const usage = user.usage || {}; // usage = { aiTool1: 10, aiTool2: 5, ... }

    // 1. Total AI generation by user
    const totalAIGeneration = Object.values(usage).reduce((acc, val) => acc + val, 0);

    // 2. Total website projects
    const totalWebsites = await Website.countDocuments({ user: req.user.id });

    // 3. Total usage (all AI tools combined) - same as totalAIGeneration for now
    const totalUsage = totalAIGeneration;

    // 4. This week's usage
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    // Assuming you store timestamps for each generation in user.usageHistory = [{ tool, createdAt }]
    let thisWeekUsage = 0;
    if (user.usageHistory && Array.isArray(user.usageHistory)) {
      thisWeekUsage = user.usageHistory.filter(
        (entry) => new Date(entry.createdAt) >= weekAgo
      ).length;
    } else {
      thisWeekUsage = totalAIGeneration; // fallback if no timestamps
    }

    // 5. User recent activity - last 5 items from usageHistory or usage keys
    let recentActivity = [];
    if (user.usageHistory && Array.isArray(user.usageHistory)) {
      recentActivity = user.usageHistory
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((entry) => ({
          tool: entry.tool,
          date: entry.createdAt,
        }));
    } else {
      recentActivity = Object.keys(usage)
        .filter((key) => usage[key] > 0)
        .slice(0, 5)
        .map((tool) => ({
          tool,
          count: usage[tool],
        }));
    }

    // 6. Most used AI tool by user
    const mostUsedTool = Object.keys(usage).reduce((a, b) =>
      usage[a] > usage[b] ? a : b
    , null);

    // Prepare usage data for bar chart
    const aiUsageBarData = Object.keys(usage).map((tool) => ({
      tool,
      count: usage[tool],
    }));

    res.status(200).json({
      totalAIGeneration,
      totalWebsites,
      totalUsage,
      thisWeekUsage,
      recentActivity,
      mostUsedTool,
      aiUsageBarData, // frontend can plot this in a bar chart
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Get all images
exports.getAllImages = async (req, res) => {
  try {
    // Optional: implement pagination with query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Fetch images with user details
    const images = await Image.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

    // Total count
    const totalImages = await Image.countDocuments();

    res.status(200).json({
      images,
      page,
      limit,
      totalImages,
      totalPages: Math.ceil(totalImages / limit),
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Server Error" });
  }
};