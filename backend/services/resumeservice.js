const pdf = require("pdf-parse");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { getMessageText, safeJsonParse, withTimeout } = require("../utils/aihelpers");

const RESUME_TIMEOUT_MS = Number(process.env.RESUME_AI_TIMEOUT_MS || 14000);
const INVALID_RESUME_MESSAGE = "Please upload a valid resume file only.";

function getResumeModel() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new ChatGoogleGenerativeAI({
    model: process.env.RESUME_AI_MODEL || "gemini-2.5-flash",
    temperature: 0.2,
    apiKey: process.env.GEMINI_API_KEY,
    maxRetries: 1,
  });
}

function fallbackAnalysis(resumeText = "", prompt = "") {
  const text = String(resumeText || "");
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z][a-z0-9+#.-]*/g) || [];
  const uniqueWords = new Set(words);
  const sectionChecks = {
    summary: /\b(summary|profile|objective)\b/i.test(text),
    experience: /\b(experience|employment|work history|internship)\b/i.test(text),
    education: /\b(education|degree|university|college|school)\b/i.test(text),
    skills: /\b(skills|technologies|tools)\b/i.test(text),
    projects: /\b(projects|portfolio)\b/i.test(text),
    certifications: /\b(certifications|certificate|certified)\b/i.test(text),
  };
  const sectionScore = Object.values(sectionChecks).filter(Boolean).length;
  const skillList = [
    "javascript",
    "react",
    "node",
    "express",
    "mongodb",
    "python",
    "java",
    "sql",
    "aws",
    "docker",
    "git",
    "html",
    "css",
    "typescript",
  ];
  const detectedSkills = skillList
    .filter((skill) => lower.includes(skill))
    .map((skill) => ({
      skill: skill === "node" ? "Node.js" : skill.toUpperCase() === skill ? skill : skill.replace(/^\w/, (c) => c.toUpperCase()),
      percentage: Math.min(95, 45 + (lower.match(new RegExp(`\\b${skill}\\b`, "g")) || []).length * 15),
    }));
  const keywordDensity = Array.from(uniqueWords)
    .filter((word) => word.length > 3 && !["with", "from", "this", "that", "have", "using", "will"].includes(word))
    .slice(0, 8)
    .map((keyword) => ({
      keyword,
      count: words.filter((word) => word === keyword).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const hasContact = /\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text) || /\b(?:\+?\d[\d\s().-]{8,}\d)\b/.test(text);
  const actionVerbs = (lower.match(/\b(built|created|developed|designed|implemented|led|managed|improved|optimized|deployed)\b/g) || []).length;
  const projectScore = sectionChecks.projects ? Math.min(90, 50 + actionVerbs * 8) : 35;
  const atsScore = Math.min(95, 35 + sectionScore * 8 + detectedSkills.length * 3 + (hasContact ? 10 : 0));
  const overallScore = Math.min(95, Math.round((atsScore + projectScore + Math.min(90, words.length / 12)) / 3));
  const targetRole = /frontend|react/i.test(prompt)
    ? "Frontend Developer"
    : /backend|node/i.test(prompt)
      ? "Backend Developer"
      : /data|machine|ai/i.test(prompt)
        ? "Data/AI Role"
        : "Software Developer";

  return {
    overallScore,
    atsScore,
    roleProbability: [
      { role: targetRole, probability: Math.min(92, atsScore) },
      { role: "Full Stack Developer", probability: Math.max(45, atsScore - 12) },
      { role: "Software Engineer", probability: Math.max(40, atsScore - 18) },
    ],
    skillStrength: detectedSkills.length
      ? detectedSkills.slice(0, 8)
      : [
          { skill: "Communication", percentage: 55 },
          { skill: "Problem Solving", percentage: 50 },
        ],
    keywordDensity: keywordDensity.length ? keywordDensity : [{ keyword: "resume", count: 1 }],
    projectStrength: [
      { category: "Project clarity", score: projectScore },
      { category: "Impact metrics", score: /\b\d+%|\b\d+x|\b\d+\+/.test(text) ? 78 : 45 },
      { category: "Technical depth", score: detectedSkills.length ? Math.min(90, 45 + detectedSkills.length * 6) : 40 },
    ],
    sections: sectionChecks,
    suggestions: [
      hasContact ? "Contact details are present." : "Add email and phone number near the top.",
      sectionChecks.projects ? "Add measurable impact to each project, such as performance, users, or revenue." : "Add a projects section with 2-3 strong role-relevant projects.",
      detectedSkills.length ? "Group technical skills by category for better ATS readability." : "Add a dedicated skills section with role-specific tools and technologies.",
      "Use action verbs and quantify achievements wherever possible.",
    ],
  };
}

function looksLikeResume(text) {
  const normalized = String(text || "").toLowerCase();
  const resumeSignals = [
    /\bexperience\b/,
    /\beducation\b/,
    /\bskills?\b/,
    /\bprojects?\b/,
    /\bcertifications?\b/,
    /\bwork history\b/,
    /\bemployment\b/,
    /\blinkedin\b/,
    /\bgithub\b/,
    /\bportfolio\b/,
    /\bobjective\b/,
    /\bsummary\b/,
  ];
  const documentSignals = [
    /\btable of contents\b/,
    /\babstract\b/,
    /\bchapter\b/,
    /\breferences\b/,
    /\bbibliography\b/,
    /\bproject report\b/,
    /\bsynopsis\b/,
    /\bmethodology\b/,
    /\bliterature review\b/,
  ];

  const signalCount = resumeSignals.reduce((count, pattern) => count + (pattern.test(normalized) ? 1 : 0), 0);
  const docSignalCount = documentSignals.reduce((count, pattern) => count + (pattern.test(normalized) ? 1 : 0), 0);
  const hasContact = /\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text) || /\b(?:\+?\d[\d\s().-]{8,}\d)\b/.test(text);

  return signalCount >= 3 && hasContact && docSignalCount < 3;
}

exports.resumeanalyze = async (buffer, prompt = "") => {
  let resumeText = "";
  try {
    const data = await pdf(buffer);
    resumeText = String(data?.text || "").trim().slice(0, 9000);

    if (!resumeText) {
      throw new Error("Could not extract text from PDF");
    }

    if (!looksLikeResume(resumeText)) {
      throw new Error(INVALID_RESUME_MESSAGE);
    }

    const finalPrompt = `Analyze only the candidate resume below and return strict JSON only.
If the text is not a resume/CV, return {"invalidResume": true}.
Use numbers from 0-100.

JSON shape:
{
  "overallScore": number,
  "atsScore": number,
  "roleProbability": [{"role": "string", "probability": number}],
  "skillStrength": [{"skill": "string", "percentage": number}],
  "keywordDensity": [{"keyword": "string", "count": number}],
  "projectStrength": [{"category": "string", "score": number}],
  "sections": {"summary": boolean, "experience": boolean, "education": boolean, "skills": boolean, "projects": boolean, "certifications": boolean},
  "suggestions": ["string", "string", "string"]
}

Request: ${prompt}
Resume:
${resumeText}`;

    const model = getResumeModel();
    if (!model) {
      throw new Error("No resume provider API key configured");
    }
    const result = await withTimeout(
      model.invoke(finalPrompt),
      RESUME_TIMEOUT_MS,
      "Resume analysis",
    );

    const parsed = safeJsonParse(getMessageText(result), fallbackAnalysis(resumeText, prompt));
    if (parsed?.invalidResume) {
      throw new Error(INVALID_RESUME_MESSAGE);
    }
    if (!parsed || Number(parsed.overallScore) === 0) {
      return fallbackAnalysis(resumeText, prompt);
    }
    return parsed;
  } catch (error) {
    console.error("Resume analyze service error:", error);
    if (error.message === INVALID_RESUME_MESSAGE) {
      throw error;
    }
    return fallbackAnalysis(resumeText, prompt);
  }
};
