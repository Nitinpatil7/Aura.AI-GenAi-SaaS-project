const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  correctAnswer: String,
  feedback: String,
  round: Number,
  score: Number,
  timedOut: { type: Boolean, default: false },
});

const mockInterviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tech: { type: String, required: true }, // e.g., MERN, Python
  rounds: Number,
  currentRound: { type: Number, default: 1 },
  questions: [answerSchema],
  startedAt: { type: Date, default: Date.now },
  finishedAt: Date,
  totalScore: { type: Number, default: 0 },
});

module.exports = mongoose.model(
  "mockAi",
  mockInterviewSessionSchema
);
