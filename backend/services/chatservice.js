const { ChatOpenAI } = require("@langchain/openai");
const { ChatGroq } = require("@langchain/groq");
const { withTimeout } = require("../utils/aihelpers");

const CHAT_TIMEOUT_MS = Number(process.env.AI_CHAT_TIMEOUT_MS || 8000);

function getChatModel() {
  if (process.env.GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.AI_CHAT_MODEL || "llama-3.1-8b-instant",
      temperature: 0.35,
      maxTokens: 350,
      maxRetries: 1,
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new ChatOpenAI({
    modelName: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    temperature: 0.35,
    maxTokens: 350,
    maxRetries: 1,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

exports.chatbot = async (userMessage) => {
  const systemPrompt = `You are Aura AI, the fast in-app assistant for Aura.ai.
Answer the user's exact question with practical, accurate guidance.

Aura.ai facts:
- Tools: AI chat, image generation, code writer, website generator, resume analyzer, YouTube summarizer, mock interview.
- Free: image 3, code 5, website 1, resume 1, YouTube 5, mock interview 1, chat unlimited.
- Pro: image 50, code 50, website 15, resume unlimited, YouTube unlimited, mock interview 5, chat unlimited. Price: INR 499/month or INR 4999/year.
- Premium: unlimited usage for all tools. Price: INR 899/month or INR 9999/year.
- Payments use Razorpay. Upgrades are available from the Pricing page.

Rules:
- Keep replies under 140 words unless the user asks for detail.
- Prefer bullets or short steps.
- If the user asks for a prompt, template, code, resume feedback, or website idea, give a directly usable answer.
- If information is missing, ask one short clarifying question.
- Do not claim to remember earlier chats.`;

  try {
    const model = getChatModel();
    if (!model) {
      throw new Error("No chat provider API key configured");
    }
    const result = await withTimeout(
      model.invoke([
        ["system", systemPrompt],
        ["human", userMessage],
      ]),
      CHAT_TIMEOUT_MS,
      "AI assistant",
    );

    return result.content;
  } catch (error) {
    console.error("AI assistant provider failed:", error.message);
    const message = String(userMessage || "").trim();
    if (/^(hi|hello|hey|hii|hola)\b/i.test(message)) {
      return "Hello! I am Aura AI. I can help you write code, create prompts, plan a website, improve a resume, summarize YouTube videos, prepare for interviews, or generate image ideas. What would you like to build today?";
    }

    return `Here is a practical response for your request: "${message}".

- Main answer: I can help you turn this into a clear output right away.
- Best next step: share the exact format you want, such as code, bullet points, a prompt, a summary, or a checklist.
- For strong results, include your goal, audience, tech stack, and any constraints.`;
  }
};
