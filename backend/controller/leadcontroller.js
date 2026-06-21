const Lead = require("../model/lead");
const { generateLeadMessage } = require("../services/leadMessageService");
const { sendLeadEmail, isValidEmail } = require("../services/leadEmailService");

const allowedFilters = ["status", "type"];

function buildLeadQuery(query) {
  const mongoQuery = {};

  allowedFilters.forEach((key) => {
    if (query[key]) mongoQuery[key] = query[key];
  });

  if (query.search) {
    const search = String(query.search).trim();
    mongoQuery.$or = [
      { companyName: new RegExp(search, "i") },
      { category: new RegExp(search, "i") },
      { city: new RegExp(search, "i") },
      { country: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { ownerName: new RegExp(search, "i") },
      { hrName: new RegExp(search, "i") },
      { source: new RegExp(search, "i") },
    ];
  }

  return mongoQuery;
}

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 25), 1), 100);
    const skip = (page - 1) * limit;
    const query = { ...buildLeadQuery(req.query), user: req.user._id };

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    res.json({ success: true, leads, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid lead id" });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, message: "Lead deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid lead id" });
  }
};

exports.generateMessage = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    const message = await generateLeadMessage(lead);
    lead.message = message;
    lead.status = "message_generated";
    await lead.save();

    res.json({ success: true, lead, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { confirmed, message } = req.body;
    if (!confirmed) {
      return res.status(400).json({
        success: false,
        message: "Email requires manual user confirmation before sending.",
      });
    }

    const lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    if (!isValidEmail(lead.email)) {
      return res.status(400).json({ success: false, message: "Lead email is invalid." });
    }

    const finalMessage = String(message || lead.message || "").trim();
    if (!finalMessage) {
      return res.status(400).json({ success: false, message: "Please generate or write a message first." });
    }

    await sendLeadEmail({ lead, message: finalMessage });

    const now = new Date();
    const nextFollowUpAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    lead.message = finalMessage;
    lead.status = "sent";
    lead.lastContactedAt = now;
    lead.nextFollowUpAt = nextFollowUpAt;
    await lead.save();

    res.json({ success: true, lead, message: "Email sent. Follow-up scheduled for 3 days later." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.getFollowups = async (req, res) => {
  try {
    const now = new Date();
    const leads = await Lead.find({
      user: req.user._id,
      status: "follow_up_needed",
      nextFollowUpAt: { $lte: now },
    }).sort({ nextFollowUpAt: 1 });

    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeadStats = async (req, res) => {
  try {
    const [total, byStatus, byType, followUpsDue, converted] = await Promise.all([
      Lead.countDocuments({ user: req.user._id }),
      Lead.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
      Lead.countDocuments({ user: req.user._id, status: "follow_up_needed" }),
      Lead.countDocuments({ user: req.user._id, status: "converted" }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        followUpsDue,
        converted,
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
