"use client";

import { useState, useRef, useEffect, useContext } from "react";
import Link from "next/link";
import {
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
} from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

// ---------- COMPONENTS ----------
function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-purple-600 outline-none transition dark:bg-gray-900 dark:border-gray-700 dark:text-white ${className}`}
      {...props}
    />
  );
}

function ScrollArea({ children, className = "", ...props }) {
  return (
    <div className={`overflow-y-auto ${className}`} {...props}>
      {children}
    </div>
  );
}

// ---------- MAIN PAGE ----------
export default function ChatbotPage() {
  const { api } = useContext(appcontext);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [isQuota, setIsQuota] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const scrollAreaRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    setError("");
    setIsQuota(false);
    setIsUnauthorized(false);

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const text = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${api}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || "Failed to get reply";

        // 1️⃣ Quota exceeded
        if (res.status === 403 && /quota|upgrade/i.test(msg)) {
          setIsQuota(true);
          throw new Error("Your AI quota is exceeded. Please upgrade your plan.");
        }

        // 2️⃣ Unauthorized / Token invalid
        if (res.status === 401 || /token/i.test(msg)) {
          setIsUnauthorized(true);
          throw new Error("Session expired. Please login to continue.");
        }

        throw new Error(msg);
      }

      const aiMessage = {
        role: "assistant",
        content: data?.reply || "No reply received.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      setError(e?.message || "Something went wrong");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            e?.message ||
            "I couldn’t complete that request right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Error / Quota / Unauthorized */}
        {(error || isQuota || isUnauthorized) && (
          <div className="px-4 pt-4">
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-gray-800 dark:border-red-600 dark:text-red-400 text-red-700 text-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>{error}</span>

              {isQuota && (
                <Link
                  href="/user/dashboard/pricing"
                  className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold"
                >
                  Upgrade Plan
                </Link>
              )}

              {isUnauthorized && (
                <Link
                  href="/auth/signin"
                  className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-4 space-y-4 overflow-y-auto max-h-full"
        >
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}

              <div
                className={`max-w-[70%] p-3 rounded-2xl shadow-lg break-words ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                <p>{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs mt-1 text-right text-neutral-100 dark:text-gray-400">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-10 h-10 bg-gray-700 dark:bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl shadow-lg flex gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
          <Button className="p-2">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button className="p-2">
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSend}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
