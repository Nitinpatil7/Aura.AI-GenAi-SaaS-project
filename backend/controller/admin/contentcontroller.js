const Image = require("../../model/image");
const Code = require("../../model/code");
const Website = require("../../model/website");
const User = require("../../model/usermodel");

exports.getContentStats = async (req, res) => {
  try {
    const images = await Image.countDocuments();
    const codes = await Code.countDocuments();
    const websites = await Website.countDocuments();

    // Fetch latest 10 for each type
    const latestImages = await Image.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const latestCodes = await Code.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const latestWebsites = await Website.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    // Map to unified format
    let latestContent = [
      ...latestImages.map((item) => ({
        title: item.title,
        type: "Image",
        user: item.user?.name || "Unknown",
        date: item.createdAt,
        size: item.size || null,
      })),
      ...latestCodes.map((item) => ({
        title: item.title,
        type: "Code",
        user: item.user?.name || "Unknown",
        date: item.createdAt,
        size: item.size || null,
      })),
      ...latestWebsites.map((item) => ({
        title: item.title,
        type: "Website",
        user: item.user?.name || "Unknown",
        date: item.createdAt,
        size: item.size || null,
      })),
    ];

    // Sort by most recent content without randomization.
    latestContent.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to 10 items
    latestContent = latestContent.slice(0, 10);

    res.json({
      images,
      codes,
      websites,
      totalContent: images + codes + websites,
      latestContent,
    });
  } catch (error) {
    console.error("Error fetching content stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
