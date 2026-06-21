const ytdl = require("ytdl-core");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { YoutubeTranscript } = require("youtube-transcript");
const { getMessageText, safeJsonParse, withTimeout } = require("../utils/aihelpers");

const YOUTUBE_INFO_TIMEOUT_MS = Number(process.env.YOUTUBE_INFO_TIMEOUT_MS || 8000);
const YOUTUBE_AI_TIMEOUT_MS = Number(process.env.YOUTUBE_AI_TIMEOUT_MS || 10000);

function getSummaryModel() {
  if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
    return null;
  }

  return new ChatGoogleGenerativeAI({
    model: process.env.YOUTUBE_AI_MODEL || "gemini-2.5-flash",
    temperature: 0.2,
    apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    maxRetries: 1,
  });
}

function normalizeYouTubeUrl(url) {
  if (url.includes("list=")) return { type: "playlist", url };
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) url = `https://www.youtube.com/watch?v=${shortMatch[1]}`;
  if (url.includes("/shorts/")) url = url.replace("/shorts/", "/watch?v=");
  return { type: "video", url };
}

function extractVideoId(url) {
  const normalized = normalizeYouTubeUrl(url).url;
  const match =
    normalized.match(/[?&]v=([^&]+)/) ||
    normalized.match(/youtu\.be\/([^?&]+)/);
  return match?.[1] || "";
}

function splitSentences(text, limit = 8) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20)
    .slice(0, limit);
}

function fallbackSummary(videoDetails) {
  const title = String(videoDetails.title || "this video").trim();
  const transcript = String(videoDetails.fullTranscript || videoDetails.description || "").trim();
  const sentences = splitSentences(transcript, 10);
  const usefulPoints = sentences.length
    ? sentences.slice(0, 7)
    : [
        `The video is titled "${title}".`,
        "A full transcript was not available from YouTube.",
        "Use the transcript tab for any fetched description or fallback metadata.",
      ];
  const quickSummary = [
    `This video focuses on: ${title}.`,
    ...usefulPoints.slice(0, 4),
    "For best accuracy, retry when transcript access is available.",
  ].join("\n");

  return {
    quickSummary,
    keyPoints: usefulPoints,
    importantQuotes: sentences.slice(0, 3),
    fullTranscript: transcript || "Transcript unavailable. YouTube did not return captions or a detailed description for this video.",
  };
}

async function getVideoDetails(url) {
  const normalized = normalizeYouTubeUrl(url);

  if (normalized.type === "playlist") {
    return { error: true, message: "Playlists cannot be summarized. Provide a single video URL." };
  }

  try {
    if (!ytdl.validateURL(normalized.url)) {
      return { error: true, message: "Invalid YouTube URL." };
    }

    const info = await withTimeout(
      ytdl.getBasicInfo(normalized.url),
      YOUTUBE_INFO_TIMEOUT_MS,
      "YouTube video fetch",
    );
    const videoId = info.videoDetails.videoId;

    let fullTranscript = "";
    try {
      const transcriptData = await withTimeout(
        YoutubeTranscript.fetchTranscript(videoId),
        YOUTUBE_INFO_TIMEOUT_MS,
        "YouTube transcript fetch",
      );
      fullTranscript = transcriptData?.length
        ? transcriptData.map((t) => t.text).join("\n")
        : "";
    } catch (error) {
      console.warn("Transcript fetch failed, using description:", error.message);
    }

    if (!fullTranscript) {
      fullTranscript = info.videoDetails.description || "No transcript or description available.";
    }

    return {
      error: false,
      title: info.videoDetails.title || "No title available",
      description: info.videoDetails.description || "No description available",
      thumbnail: info.videoDetails.thumbnails?.[0]?.url || "",
      channel: info.videoDetails.author?.name || "Unknown channel",
      publishedAt: info.videoDetails.uploadDate || "",
      fullTranscript,
    };
  } catch (error) {
    console.error("getVideoDetails error:", error);
    const videoId = extractVideoId(normalized.url);
    return {
      error: false,
      title: videoId ? `YouTube video ${videoId}` : "YouTube video",
      description:
        "Live YouTube metadata could not be fetched quickly, so Aura generated a fallback summary from the URL.",
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "",
      channel: "Unknown channel",
      publishedAt: "",
      fullTranscript:
        "Transcript unavailable. The video metadata service timed out or was blocked. Retry later for a full transcript-based summary.",
    };
  }
}

async function generateSummary(videoDetails) {
  if (videoDetails.error) {
    return {
      quickSummary: videoDetails.message,
      keyPoints: [],
      importantQuotes: [],
      fullTranscript: videoDetails.fullTranscript || "",
    };
  }

  const safeTitle = String(videoDetails.title || "").slice(0, 200);
  const safeTranscript = String(videoDetails.fullTranscript || "").slice(0, 4500);

  const prompt = `Return strict JSON only for this YouTube summary.
Title: ${safeTitle}
Transcript:
${safeTranscript}

JSON:
{
  "quickSummary": "5 concise lines",
  "keyPoints": ["short point"],
  "importantQuotes": ["quote if any"],
  "fullTranscript": "clean readable transcript or compact transcript"
}`;

  try {
    const model = getSummaryModel();
    if (!model) {
      throw new Error("No YouTube summary provider API key configured");
    }
    const result = await withTimeout(
      model.invoke(prompt),
      YOUTUBE_AI_TIMEOUT_MS,
      "YouTube AI summary",
    );
    const parsed = safeJsonParse(getMessageText(result), null);

    if (parsed) {
      return {
        quickSummary: parsed.quickSummary || "",
        keyPoints: parsed.keyPoints || [],
        importantQuotes: parsed.importantQuotes || [],
        fullTranscript: parsed.fullTranscript || safeTranscript,
      };
    }

    return {
      quickSummary: getMessageText(result).slice(0, 1000),
      keyPoints: [],
      importantQuotes: [],
      fullTranscript: safeTranscript,
    };
  } catch (error) {
    console.error("AI summary error:", error);
    return fallbackSummary({ ...videoDetails, fullTranscript: safeTranscript });
  }
}

module.exports = { getVideoDetails, generateSummary };
