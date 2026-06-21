require("dotenv").config();

process.env.HF_IMAGE_TIMEOUT_MS = "1";
process.env.POLLINATIONS_TIMEOUT_MS = "1";
process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS = "1";
process.env.AI_CHAT_TIMEOUT_MS = "1";
process.env.WEBSITE_AI_TIMEOUT_MS = "1";
process.env.YOUTUBE_INFO_TIMEOUT_MS = "1";
process.env.YOUTUBE_AI_TIMEOUT_MS = "1";
process.env.RESUME_AI_TIMEOUT_MS = "1";

const { generateImage, uploadImage } = require("../services/imageservice");
const { chatbot } = require("../services/chatservice");
const { generatewebsite } = require("../services/websiteservice");
const { getVideoDetails, generateSummary } = require("../services/ytservice");
const { resumeanalyze } = require("../services/resumeservice");

async function run() {
  const imageData = await generateImage("modern AI workspace", "realistic", 1, "1:1");
  const uploaded = await uploadImage(imageData);
  console.log("image:", Array.isArray(uploaded), uploaded.length, String(uploaded[0]).slice(0, 24));

  const chat = await chatbot("What can Aura AI do?");
  console.log("chat:", typeof chat, chat.length > 20);

  const website = await generatewebsite({
    type: "saas",
    theme: "purple",
    font: "modern",
    prompt: "AI writing assistant",
  });
  console.log("website:", website.includes("<html"), website.length > 500);

  const video = await getVideoDetails("https://youtu.be/encHIv_ouhU");
  const summary = await generateSummary(video);
  console.log("youtube:", !video.error, Boolean(summary.quickSummary));

  const resume = await resumeanalyze(Buffer.from("not a real pdf"), "frontend role");
  console.log("resume:", typeof resume === "object", Array.isArray(resume.suggestions));
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
  });
