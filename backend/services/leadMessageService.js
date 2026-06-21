const { ChatGroq } = require("@langchain/groq");
const { ChatOpenAI } = require("@langchain/openai");
const { getMessageText, withTimeout } = require("../utils/aihelpers");

const LEAD_MESSAGE_TIMEOUT_MS = Number(process.env.LEAD_MESSAGE_TIMEOUT_MS || 12000);

function getLeadMessageModel() {
  if (process.env.GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.LEAD_AI_MODEL || process.env.AI_CHAT_MODEL || "llama-3.1-8b-instant",
      temperature: 0.45,
      maxTokens: 220,
      maxRetries: 1,
    });
  }

  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.LEAD_OPENAI_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    temperature: 0.45,
    maxTokens: 220,
    maxRetries: 1,
  });
}

function contactName(lead) {
  if (lead.type === "internship" && lead.hrName) return lead.hrName;
  return lead.ownerName || lead.hrName || "there";
}

function fallbackLeadMessage(lead) {
  const greeting = `Hi ${contactName(lead)},`;

  if (lead.type === "internship") {
    return `${greeting}

I came across ${lead.companyName} and wanted to ask if you have any MERN stack internship opportunities available. I can help with React, Next.js, Node.js, Express, MongoDB, and clean frontend implementation.

Would it be okay if I shared my resume or a few project links for your review?`;
  }

  const websiteLine = lead.hasWebsite
    ? "I noticed your online presence and thought there may be room to improve conversion, speed, or the overall customer journey."
    : "I noticed you may benefit from a simple, professional website or booking/contact flow.";

  return `${greeting}

I came across ${lead.companyName}. ${websiteLine} I build clean websites and web apps that help businesses look trustworthy and make it easier for customers to take action.

Would you be open to a quick chat about how I could help?`;
}

function buildLeadPrompt(lead) {
  const leadTypeInstruction =
    lead.type === "internship"
      ? "Ask politely for a MERN stack internship opportunity."
      : "Offer website or app development services politely.";

  return `Write one personalized outreach email body.

Lead:
- Type: ${lead.type}
- Company: ${lead.companyName}
- Category: ${lead.category || "Not provided"}
- City/Country: ${[lead.city, lead.country].filter(Boolean).join(", ") || "Not provided"}
- Website: ${lead.website || "Not provided"}
- Has website: ${lead.hasWebsite ? "yes" : "no"}
- Website quality: ${lead.websiteQuality || "Not provided"}
- Owner name: ${lead.ownerName || "Not provided"}
- HR name: ${lead.hrName || "Not provided"}
- Source: ${lead.source || "Not provided"}

Goal: ${leadTypeInstruction}

Rules:
- Short, human, non-spammy.
- Mention ${lead.companyName}.
- Mention clear value.
- Add a polite CTA.
- Do not invent facts.
- Do not include a subject line.
- Do not include signatures, placeholders, or markdown.`;
}

async function generateLeadMessage(lead) {
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    return fallbackLeadMessage(lead);
  }

  try {
    const model = getLeadMessageModel();
    const result = await withTimeout(
      model.invoke(buildLeadPrompt(lead)),
      LEAD_MESSAGE_TIMEOUT_MS,
      "Lead message generation",
    );

    const text = getMessageText(result).trim();
    return text || fallbackLeadMessage(lead);
  } catch (error) {
    console.error("Lead message provider failed:", error.message);
    return fallbackLeadMessage(lead);
  }
}

module.exports = { generateLeadMessage };
