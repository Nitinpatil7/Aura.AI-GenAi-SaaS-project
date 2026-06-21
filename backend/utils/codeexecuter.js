const { exec } = require("child_process");

exports.executeCode = async (code, language) => {
  // For now, only JS example
  if (language === "javascript") {
    try {
      let output = eval(code); // ⚠️ unsafe for production, use sandbox in real app
      return { success: true, expectedOutput: output };
    } catch (err) {
      return { success: false, expectedOutput: err.message };
    }
  }
};