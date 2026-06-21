"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { Send, Copy, Download } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import Link from "next/link";

export default function CodeWriterPage() {
  const { api } = useContext(appcontext);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI Code Writer. Ask me to generate any code."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isQuota, setIsQuota] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // COPY CODE
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setError("Code copied to clipboard!");
    setTimeout(() => setError(""), 2000);
  };

  // DOWNLOAD CODE
  const downloadCode = (code) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-code.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  // SEND PROMPT
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const prompt = input;
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);
    setError("");
    setIsUnauthorized(false);
    setIsQuota(false);

    try {
      const res = await fetch(`${api}/ai/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("Raw response:", text);
        data = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          setIsUnauthorized(true);
          throw new Error("Session expired. Please login to continue.");
        }
        if (res.status === 403 || /quota/i.test(data.message || "")) {
          setIsQuota(true);
          throw new Error("Your quota is exceeded. Upgrade your plan to continue.");
        }
        throw new Error(data.message || `Server error ${res.status}`);
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Here is your generated code:",
          code: data.code,
          explanation: data.explanation,
          language: data.language || "javascript"
        }
      ]);

    } catch (err) {
      console.error("AI code generation error:", err);
      setError(err.message || "Failed to generate code.");
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Failed to generate code. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-50 dark:bg-gray-900">

      {/* HEADER */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Code Writer</h1>
        <p className="text-gray-500 dark:text-gray-300 text-sm">
          Generate clean production-ready code instantly with AI
        </p>
      </div>

      {/* ERROR / LOGIN / QUOTA */}
      {(error || isUnauthorized || isQuota) && (
        <div className="px-4 py-2">
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-gray-800 dark:border-red-600 dark:text-red-400 text-red-700 text-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{error}</span>
            {isUnauthorized && (
              <Link
                href="/auth/signin"
                className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold"
              >
                Login
              </Link>
            )}
            {isQuota && (
              <Link
                href="/user/dashboard/pricing"
                className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-4 rounded-xl border border-gray-200 shadow-sm max-w-[75%] text-sm ${msg.role === "user" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none" : "bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"}`}>
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* CODE BLOCK */}
                {msg.code && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyCode(msg.code)}
                          className="text-xs border border-gray-200 dark:border-gray-600 px-2 py-1 rounded"
                        >
                          <Copy size={12} /> Copy
                        </button>
                        <button
                          onClick={() => downloadCode(msg.code)}
                          className="text-xs border border-gray-200 dark:border-gray-600 px-2 py-1 rounded"
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </div>
                    <pre className="bg-black text-green-400 text-xs p-4 rounded overflow-x-auto">
                      <code>{msg.code}</code>
                    </pre>
                  </div>
                )}

                {/* EXPLANATION */}
                {msg.explanation && (
                  <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Explanation</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{msg.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded shadow flex gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300"></div>
                <span className="text-sm text-gray-500 dark:text-gray-300 ml-2">Generating code...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* INPUT */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
          <input
            type="text"
            placeholder="Ask AI to generate code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 outline-none text-sm bg-transparent text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
