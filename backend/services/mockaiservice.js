const { ChatGroq } = require("@langchain/groq");
const mockAi = require("../model/mockai");
const { getMessageText, safeJsonParse, withTimeout } = require("../utils/aihelpers");

const MOCK_AI_TIMEOUT_MS = Number(process.env.MOCK_AI_TIMEOUT_MS || 8000);

function getInterviewModel() {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  return new ChatGroq({
    model: process.env.MOCK_AI_MODEL || "llama-3.1-8b-instant",
    temperature: 0.45,
    apiKey: process.env.GROQ_API_KEY,
    maxTokens: 900,
    maxRetries: 1,
  });
}

async function askJson(prompt, fallback) {
  try {
    const model = getInterviewModel();
    if (!model) {
      throw new Error("No mock interview provider API key configured");
    }
    const result = await withTimeout(
      model.invoke(prompt),
      MOCK_AI_TIMEOUT_MS,
      "Mock interview AI",
    );
    return safeJsonParse(getMessageText(result), fallback);
  } catch (error) {
    console.error("Mock interview AI error:", error);
    return fallback;
  }
}

function questionBank(tech) {
  return [
    `To understand your current level, please introduce yourself and describe your hands-on experience with ${tech}.`,
    `Tell me about one real project where you used ${tech}. What problem did you solve?`,
    `What was the toughest technical issue you faced in ${tech}, and how did you debug it?`,
    `Explain one core ${tech} concept you are confident in, with a practical example.`,
    `If you had to improve performance or reliability in a ${tech} project, what would you check first?`,
    `Describe a mistake you made while working with ${tech} and what you learned from it.`,
    `How would you explain ${tech} to a junior teammate starting today?`,
  ];
}

function scoreAnswer(answer) {
  const text = String(answer || "").trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let score = 3;
  if (wordCount > 20) score += 2;
  if (wordCount > 45) score += 2;
  if (/\b(project|built|implemented|debugged|deployed|optimized|designed|created)\b/i.test(text)) score += 1;
  if (/\b(because|tradeoff|result|impact|users|performance|testing|error)\b/i.test(text)) score += 1;
  return Math.min(score, 10);
}

function fallbackFeedback(answer, score) {
  if (score >= 8) return "Strong answer with useful detail and practical context.";
  if (score >= 6) return "Good answer, but add a clearer example, tradeoff, or measurable result.";
  return "Your answer needs more depth. Explain what you did, why you did it, and what happened.";
}

exports.startInterview = async (userId, tech) => {
  const session = new mockAi({
    user: userId,
    tech,
    questions: [],
    totalScore: 0,
  });

  await session.save();

  const fallback = {
    welcome: "Hello, I am Aura AI interviewer. Let us begin your mock interview.",
    guidelines: ["Answer like a real interview", "Use project examples", "Explain your exact contribution"],
    question: questionBank(tech)[0],
  };

  const intro = await askJson(
    `Return strict JSON only:
{
  "welcome": "short welcome",
  "guidelines": ["three short interview tips"],
  "question": "first realistic interview question about ${tech}"
}

You are running a realistic adaptive mock interview for ${tech}.
Start with an HR-style question that reveals the candidate's real experience level, background, confidence, and hands-on exposure.
Do not ask trivia unrelated to ${tech}.`,
    fallback,
  );

  const question = intro.question || fallback.question;

  session.questions.push({ question, score: 0 });
  await session.save();

  return {
    sessionId: session._id,
    welcome: intro.welcome || fallback.welcome,
    guidelines: intro.guidelines || fallback.guidelines,
    question,
  };
};

exports.submitAnswer = async (sessionId, userAnswer) => {
  const session = await mockAi.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const currentQuestion = session.questions[session.questions.length - 1];
  const answeredCount = session.questions.filter((q) => q.userAnswer).length;
  const bank = questionBank(session.tech);
  const fallbackScore = scoreAnswer(userAnswer);
  const nextFallbackQuestion = bank[Math.min(answeredCount + 1, bank.length - 1)];
  const fallback = {
    score: fallbackScore,
    feedback: fallbackFeedback(userAnswer, fallbackScore),
    correctAnswer: fallbackScore < 6 ? "A stronger answer should include the situation, your action, the technical reasoning, and the result." : "",
    nextQuestion: nextFallbackQuestion,
  };

  const parsed = await askJson(
    `You are a technical interviewer. Return strict JSON only:
{
  "score": number from 0 to 10,
  "feedback": "one short sentence",
  "correctAnswer": "brief ideal answer only when the candidate answer is weak or incorrect, otherwise empty string",
  "nextQuestion": "next adaptive interview question about ${session.tech}"
}

Question: ${currentQuestion.question}
Candidate answer: ${userAnswer}
Previous answered questions: ${JSON.stringify(session.questions.filter((q) => q.userAnswer).map((q) => ({
      question: q.question,
      answer: q.userAnswer,
      score: q.score,
    })))}

Rules:
- Score accuracy, depth, clarity, examples, and confidence.
- If the candidate is weak, ask the next question to probe the same concept more practically or foundationally.
- If the candidate is strong, increase depth with a scenario, tradeoff, debugging, architecture, or behavioral follow-up.
- Do not repeat already asked questions.
- Keep nextQuestion concise and ask only one question.`,
    fallback,
  );

  currentQuestion.userAnswer = userAnswer;
  currentQuestion.correctAnswer = parsed.correctAnswer || "";
  currentQuestion.feedback = parsed.feedback || "";
  currentQuestion.score = Number(parsed.score) || 0;
  session.totalScore += currentQuestion.score;

  const askedQuestions = new Set(session.questions.map((q) => q.question));
  let nextQuestion = parsed.nextQuestion || fallback.nextQuestion;
  if (askedQuestions.has(nextQuestion)) {
    nextQuestion = bank.find((question) => !askedQuestions.has(question)) || `Give me one deeper example from your ${session.tech} work that we have not discussed yet.`;
  }
  session.questions.push({ question: nextQuestion, score: 0 });
  await session.save();

  return {
    finished: false,
    feedback: currentQuestion.feedback,
    score: currentQuestion.score,
    correctAnswer: currentQuestion.correctAnswer,
    nextQuestion,
  };
};

exports.endInterview = async (sessionId) => {
  const session = await mockAi.findById(sessionId);
  if (!session) throw new Error("Session not found");

  session.finishedAt = new Date();
  await session.save();

  const answeredQuestions = session.questions.filter((q) => q.userAnswer);
  const averageScore = answeredQuestions.length
    ? session.totalScore / answeredQuestions.length
    : 0;

  const fallback = {
    totalQuestions: answeredQuestions.length,
    totalScore: session.totalScore,
    averageScore,
    maxScore: answeredQuestions.length * 10,
    strengths: ["Completed the mock interview"],
    weaknesses: ["Add more depth and examples"],
    improvements: ["Practice structured answers", "Use project examples"],
    finalFeedback: "Keep practicing and focus on clear, specific explanations.",
  };

  const analytics = await askJson(
    `Analyze this mock interview and return strict JSON only:
{
  "totalQuestions": number,
  "totalScore": number,
  "averageScore": number,
  "maxScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvements": ["string"],
  "finalFeedback": "string"
}

Technology: ${session.tech}
Questions: ${JSON.stringify(answeredQuestions)}
Total score: ${session.totalScore}`,
    fallback,
  );

  return {
    finished: true,
    questions: answeredQuestions.map((q, index) => ({
      number: index + 1,
      question: q.question,
      userAnswer: q.userAnswer,
      score: q.score || 0,
      feedback: q.feedback || "",
      correctAnswer: (q.score || 0) < 7 ? q.correctAnswer || "" : "",
    })),
    analytics: {
      ...fallback,
      ...analytics,
      totalQuestions: answeredQuestions.length,
      totalScore: session.totalScore,
      averageScore: Number(averageScore.toFixed(1)),
      maxScore: answeredQuestions.length * 10,
    },
  };
};
