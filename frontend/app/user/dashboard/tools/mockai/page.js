"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, MessageSquare, Play, Square, TrendingUp } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

const meterBars = [26, 42, 58, 38, 50];

function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function MockInterviewPage() {
  const { api } = useContext(appcontext);

  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [tech, setTech] = useState("Frontend React");
  const [sessionId, setSessionId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [transcript, setTranscript] = useState([
    {
      speaker: "AI Interviewer",
      text: "Hello! Welcome to your mock interview. Choose a technology and start when ready.",
    },
  ]);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    setVoiceSupported(Boolean(getRecognitionCtor()));

    const synth = window.speechSynthesis;
    if (!synth) return;

    const loadVoices = () => {
      const voices = synth.getVoices();
      voiceRef.current = voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
      synth.cancel();
    };
  }, []);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.voice = voiceRef.current;
    speech.lang = "en-US";
    speech.rate = 0.92;
    speech.pitch = 0.95;
    speech.onstart = () => setIsAiSpeaking(true);
    speech.onend = () => setIsAiSpeaking(false);
    speech.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(speech);
  }, []);

  const appendTranscript = useCallback((entry) => {
    setTranscript((prev) => [...prev, entry]);
  }, []);

  const startListening = useCallback(() => {
    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      setVoiceSupported(false);
      setError("Speech input is not supported in this browser. You can still type your answer.");
      return;
    }

    if (isAiSpeaking || isSubmitting) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcriptText = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += transcriptText;
        else interimText += transcriptText;
      }

      setAnswer((prev) => {
        const base = finalText ? `${prev} ${finalText}`.trim() : prev;
        return interimText ? `${base} ${interimText}`.trim() : base;
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice capture stopped. You can try again or type your answer.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setError("");
  }, [isAiSpeaking, isSubmitting]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startInterview = useCallback(async () => {
    setError("");
    setShowResults(false);
    setAnalytics(null);
    setReviewQuestions([]);
    setAnswer("");
    setIsStarting(true);

    try {
      const res = await fetch(`${api}/ai/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tech }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to start interview");

      const welcome = data?.welcome || "Welcome to the interview.";
      const guidelines = Array.isArray(data?.guidelines) ? data.guidelines : [];
      const question = data?.question || "Tell me about your experience.";
      const introText = [welcome, ...guidelines, question].join(" ");

      setSessionId(data?.sessionId || null);
      setIsInterviewActive(true);
      setTranscript([
        { speaker: "AI Interviewer", text: welcome },
        ...(guidelines.length
          ? [{ speaker: "AI Interviewer", text: `Guidelines: ${guidelines.join("; ")}` }]
          : []),
        { speaker: "AI Interviewer", text: question },
      ]);
      speak(introText);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setIsStarting(false);
    }
  }, [api, speak, tech]);

  const submitAnswer = useCallback(async () => {
    if (!sessionId || !answer.trim() || isListening || isSubmitting) return;

    const userText = answer.trim();
    setIsSubmitting(true);
    appendTranscript({ speaker: "You", text: userText });
    setAnswer("");

    try {
      const res = await fetch(`${api}/ai/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, answer: userText }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Submit failed");

      if (data.finished) {
        setAnalytics(data.analytics);
        setReviewQuestions(data.questions || []);
        setShowResults(true);
        setIsInterviewActive(false);
        speak("Interview finished. Your results are ready.");
        return;
      }

      if (data.feedback) {
        appendTranscript({ speaker: "AI Feedback", text: data.feedback });
      }

      const nextQuestion = data?.nextQuestion || "Can you expand on your previous answer?";
      appendTranscript({ speaker: "AI Interviewer", text: nextQuestion });
      speak(nextQuestion);
    } catch (e) {
      setError(e.message || "Unable to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answer, api, appendTranscript, isListening, isSubmitting, sessionId, speak]);

  const endInterview = useCallback(async () => {
    stopListening();
    window.speechSynthesis?.cancel();
    setIsAiSpeaking(false);
    if (!sessionId) return;

    try {
      const res = await fetch(`${api}/ai/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to end interview");

      setAnalytics(data.analytics || null);
      setReviewQuestions(data.questions || []);
      setShowResults(true);
      setIsInterviewActive(false);
      speak("Interview ended. Your results are ready.");
    } catch (err) {
      setError(err.message || "Failed to end interview");
      setIsInterviewActive(false);
    }
  }, [api, sessionId, speak, stopListening]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript]);

  const scorePercent = useMemo(() => {
    const maxScore = analytics?.maxScore || (analytics?.totalQuestions || 0) * 10 || 1;
    return Math.min(((analytics?.totalScore || 0) / maxScore) * 100, 100);
  }, [analytics]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-white">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Voice Mock Interview</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Practice adaptive interviews with voice or typed answers.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {!voiceSupported && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            Speech input is unavailable in this browser. Typed answers still work.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!isInterviewActive && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="font-medium">Select Technology:</label>
                <select
                  value={tech}
                  onChange={(event) => setTech(event.target.value)}
                  className="border border-gray-200 rounded-lg p-2 flex-1 text-gray-900"
                >
                  <option>Frontend React</option>
                  <option>Backend Node.js</option>
                  <option>Fullstack MERN</option>
                  <option>Python Data Science</option>
                  <option>Java Spring</option>
                  <option>AI in Python</option>
                  <option>Machine Learning</option>
                  <option>Cloud Computing</option>
                  <option>AWS DevOps</option>
                </select>
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                {isInterviewActive ? (
                  <div className="flex gap-1 items-end" aria-label="Voice activity meter">
                    {meterBars.map((height, index) => (
                      <div
                        key={height}
                        className={`w-2 bg-white rounded ${isAiSpeaking || isListening ? "animate-pulse" : ""}`}
                        style={{ height: `${height + index * 2}px` }}
                      />
                    ))}
                  </div>
                ) : (
                  <Mic size={60} />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {isInterviewActive ? "Interview in Progress" : "Ready to Start"}
              </h2>
              <p className="text-white/80 text-sm mb-5">
                {isAiSpeaking
                  ? "AI is asking the question."
                  : isListening
                    ? "Listening to your answer."
                    : isSubmitting
                      ? "Reviewing your answer."
                      : "Answer when the AI finishes speaking."}
              </p>

              <div className="flex justify-center gap-4">
                {!isInterviewActive ? (
                  <button
                    onClick={startInterview}
                    disabled={isStarting}
                    className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg disabled:opacity-60"
                  >
                    {isStarting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                    {isStarting ? "Starting..." : "Start Interview"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isAiSpeaking || isSubmitting}
                      className="p-3 rounded-lg bg-white text-purple-600 disabled:opacity-60"
                      title={isListening ? "Stop voice input" : "Start voice input"}
                    >
                      {isListening ? <Mic /> : <MicOff />}
                    </button>
                    <button
                      onClick={endInterview}
                      className="flex items-center gap-2 bg-red-500 px-5 py-3 rounded-lg"
                    >
                      <Square size={18} />
                      End
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <h3 className="flex items-center gap-2 font-semibold mb-4">
                <MessageSquare size={18} />
                Conversation Transcript
              </h3>
              <div ref={transcriptRef} className="h-[350px] overflow-y-auto space-y-4">
                {transcript.map((entry, index) => (
                  <div
                    key={`${entry.speaker}-${index}`}
                    className={`p-4 rounded-lg border-l-4 ${
                      entry.speaker === "AI Interviewer"
                        ? "bg-purple-50 border-purple-600"
                        : entry.speaker === "AI Feedback"
                          ? "bg-amber-50 border-amber-500"
                          : "bg-blue-50 border-blue-600"
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{entry.speaker}</span>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{entry.text}</p>
                  </div>
                ))}
              </div>

              {isInterviewActive && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-900 min-h-20"
                    placeholder="Type your answer or use the microphone"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isListening || isAiSpeaking || isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : isListening ? "Finish speaking first" : "Submit"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {showResults && analytics && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 text-gray-900">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <TrendingUp size={20} />
                  Interview Results
                </h3>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Marks</span>
                    <span>
                      {analytics.totalScore || 0}/{analytics.maxScore || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${scorePercent}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-gray-500">Total Questions</p>
                      <p className="font-bold">{analytics.totalQuestions || 0}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-gray-500">Average Score</p>
                      <p className="font-bold">{analytics.averageScore || 0}/10</p>
                    </div>
                  </div>
                </div>

                <ResultList title="Strengths" tone="green" items={analytics.strengths} />
                <ResultList title="Weaknesses" tone="red" items={analytics.weaknesses} />
                <ResultList title="Improvement Tips" tone="blue" items={analytics.improvements} />

                {analytics.finalFeedback && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Feedback</h4>
                    <p className="text-sm text-gray-700">{analytics.finalFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showResults && reviewQuestions.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg mb-4">Question Review</h3>
            <div className="space-y-4">
              {reviewQuestions.map((item) => (
                <article key={item.number} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-gray-900">
                      {item.number}. {item.question}
                    </h4>
                    <span className="text-sm rounded-full bg-gray-100 px-3 py-1">{item.score}/10</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">
                    <span className="font-semibold">Your answer:</span> {item.userAnswer}
                  </p>
                  {item.feedback && (
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">Feedback:</span> {item.feedback}
                    </p>
                  )}
                  {item.correctAnswer && (
                    <p className="mt-2 text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="font-semibold">Ideal answer:</span> {item.correctAnswer}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ResultList({ title, tone, items = [] }) {
  if (!items?.length) return null;

  const classes = {
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className={`border p-2 rounded ${classes[tone]}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
