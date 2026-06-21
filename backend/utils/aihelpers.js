function withTimeout(promise, ms, label = "AI request") {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}

function cleanJson(text) {
  return String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function safeJsonParse(text, fallback = {}) {
  try {
    return JSON.parse(cleanJson(text));
  } catch {
    return fallback;
  }
}

function getMessageText(result) {
  if (!result) return "";
  if (typeof result.content === "string") return result.content;
  if (Array.isArray(result.content)) {
    return result.content.map((item) => item.text || "").join("");
  }
  return String(result.content || "");
}

module.exports = {
  cleanJson,
  getMessageText,
  safeJsonParse,
  withTimeout,
};
