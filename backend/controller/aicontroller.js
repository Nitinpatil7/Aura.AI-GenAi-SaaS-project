const { generateImage, uploadImage } = require("../services/imageservice");
const { generatewebsite } = require("../services/websiteservice");
const { generatecode } = require("../services/codeservice");
const { resumeanalyze } = require("../services/resumeservice");
const cloudinary = require("../config/cloudinary");
const { getVideoDetails, generateSummary } = require("../services/ytservice");
const { chatbot } = require("../services/chatservice");
const {
  startInterview,
  submitAnswer,
  endInterview,
} = require("../services/mockaiservice");
const User = require("../model/usermodel");
const Image = require("../model/image");
const Resume = require("../model/resume");
const Website = require("../model/website");
const YouTubeSummary = require("../model/youtubesummary");

exports.generateimage = async (req, res) => {
  try {
    const { prompt, style, count, aspect } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const images = await generateImage(prompt, style, count, aspect);
    const uploadedImages = await uploadImage(images);

    const saved = await Image.create({
      user: user._id,
      prompt,
      style,
      aspect,
      images: uploadedImages,
    });

    user.usage.image = (user.usage.image || 0) + uploadedImages.length;
    await user.save();

    res.status(200).json({
      success: true,
      images: uploadedImages,
      historyid: saved._id,
      fallback: uploadedImages.some((url) => String(url).startsWith("data:image")),
    });
  } catch (error) {
    console.error("Image controller error:", error);
    res.status(500).json({ success: false, message: error.message || "Image generation failed" });
  }
};

exports.generatewebsite = async (req, res) => {
  try {
    const { type, theme, font, prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not authenticated" });

    const websitecode = await generatewebsite({ type, theme, font, prompt });
    if (!websitecode) return res.status(500).json({ message: "Website generator returned empty response" });

    const saved = await Website.create({
      user: user._id,
      type,
      theme,
      font,
      prompt,
      code: websitecode,
    });

    user.usage.website = (user.usage.website || 0) + 1;
    await user.save();

    res.status(200).json({ success: true, code: websitecode, historyId: saved._id });
  } catch (error) {
    console.error("Website controller error:", error);
    res.status(500).json({ success: false, message: error.message || "Website generation failed" });
  }
};

exports.generatecode = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const result = await generatecode(prompt, req.user.id);
    res.status(200).json({
      success: true,
      code: result.code || "",
      explanation: result.explanation || "",
      language: result.language || "javascript",
    });
  } catch (error) {
    console.error("Code controller error:", error);
    res.status(500).json({ success: false, message: error.message || "Code generation failed" });
  }
};

exports.analyzeresume = async (req, res) => {
  try {
    const { prompt } = req.body;
    const file = req.file;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!file) return res.status(400).json({ message: "Resume file required" });
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Max file size 5MB" });
    }

    const analysis = await resumeanalyze(file.buffer, prompt);
    let fileUrl = "";

    try {
      const upload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "resume" },
          (err, result) => (err ? reject(err) : resolve(result)),
        );
        stream.end(file.buffer);
      });
      fileUrl = upload.secure_url;
    } catch (error) {
      console.warn("Cloudinary resume upload failed:", error.message);
    }

    const saved = await Resume.create({
      user: user._id,
      prompt,
      fileUrl,
      analysis,
    });

    user.usage.resume = (user.usage.resume || 0) + 1;
    await user.save();

    res.json({ success: true, result: analysis, fileUrl, historyId: saved._id });
  } catch (error) {
    console.error("Resume controller error:", error);
    if (error.message === "Please upload a valid resume file only.") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message || "Resume analysis failed" });
  }
};

exports.youtubesummary = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "YouTube URL is required" });

    const videoDetails = await getVideoDetails(url);
    if (videoDetails.error) {
      return res.status(400).json({ success: false, message: videoDetails.message });
    }

    const summary = await generateSummary(videoDetails);
    if (!summary || (!summary.quickSummary && !summary.fullTranscript)) {
      return res.status(500).json({ success: false, message: "AI failed to generate summary" });
    }

    const summaryDoc = await YouTubeSummary.create({
      user: req.user.id,
      url,
      videoDetails,
      aiSummary: summary,
    });

    const user = await User.findById(req.user.id);
    if (user) {
      user.usage.youtube = (user.usage.youtube || 0) + 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "YouTube video summarized successfully",
      data: summaryDoc,
    });
  } catch (error) {
    console.error("YouTube controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to summarize video",
      error: error.message || "Unknown error",
    });
  }
};

exports.chatbot = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const botResponse = await chatbot(message);
    const user = await User.findById(req.user.id);

    if (user) {
      user.usage.chat = (user.usage.chat || 0) + 1;
      await user.save();
    }

    res.status(200).json({ success: true, reply: botResponse });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(200).json({
      success: true,
      reply:
        "Aura assistant is running, but the live AI provider is unavailable right now. Please try again in a moment.",
    });
  }
};

exports.startMockInterview = async (req, res) => {
  try {
    const { tech } = req.body;
    const data = await startInterview(req.user.id, tech);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Mock start error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitMockAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const data = await submitAnswer(sessionId, answer);
    const user = await User.findById(req.user.id);

    if (user) {
      user.usage.interview = (user.usage.interview || 0) + 1;
      await user.save();
    }

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Mock submit error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.endMockInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const data = await endInterview(sessionId);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Mock end error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getgallery = async (req, res) => {
  try {
    const images = await Image.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error("Gallery controller error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
