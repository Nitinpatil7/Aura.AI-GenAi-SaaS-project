"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import { Youtube, Sparkles, Copy, Download } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

export default function YouTubeSummarizerPage() {
  const { api } = useContext(appcontext);
  const [url, setUrl] = useState("");
  const [darkMode] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summarized, setSummarized] = useState(false);
  const [tab, setTab] = useState("summary");
  const [error, setError] = useState("");
  const [isQuota, setIsQuota] = useState(false);
  const [result, setResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSummarize = async () => {
    if (!url.trim()) return;
    setError("");
    setIsQuota(false);
    setSummarizing(true);
    setSummarized(false);
    setResult(null);
    setSuccessMsg("");

    try {
      const res = await fetch(`${api}/ai/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.log("Raw response:", text);
        data = {};
      }

      if (!res.ok) {
        const msg = data?.message || "Failed to summarize";
        if (res.status === 403 && /quota|upgrade/i.test(msg)) setIsQuota(true);
        throw new Error(msg);
      }

      setResult(data?.data || null);
      setSummarized(true);
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSummarizing(false);
    }
  };

  const videoDetails = result?.videoDetails;
  const aiSummary = result?.aiSummary;

  const copyTabContent = async () => {
    let textToCopy = "";
    switch (tab) {
      case "summary":
        textToCopy = aiSummary?.quickSummary;
        break;
      case "keypoints":
        textToCopy = (aiSummary?.keyPoints || []).join("\n");
        break;
      case "quotes":
        textToCopy = (aiSummary?.importantQuotes || []).join("\n");
        break;
      case "transcript":
        textToCopy = aiSummary?.fullTranscript;
        break;
      default:
        textToCopy = "";
    }
    await navigator.clipboard.writeText(textToCopy || "");
    setSuccessMsg("Copied to clipboard!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2">YouTube Video Summarizer</h1>
          <p className="text-gray-500 dark:text-gray-400">Get AI generated summaries of any YouTube video</p>
        </div>

        {/* INPUT */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
          <label className="text-sm font-medium mb-2 block">YouTube URL</label>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                placeholder="Paste YouTube URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleSummarize}
              disabled={!url || summarizing}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
            >
              <Sparkles size={18} />
              {summarizing ? "Summarizing..." : "Summarize"}
            </button>
          </div>
        </div>

        {/* ERROR / SUCCESS */}
        {(error || successMsg) && (
          <div className="mb-8">
            <div className={`rounded-xl border px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${error ? "border-red-200 bg-red-50 text-red-700 dark:bg-gray-800 dark:border-red-600 dark:text-red-400" : "border-green-200 bg-green-50 text-green-700 dark:bg-gray-800 dark:border-green-600 dark:text-green-400"}`}>
              <span>{error || successMsg}</span>
              {isQuota && (
                <Link href="/user/dashboard/pricing" className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold">
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {summarized && result && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
              {/* Thumbnail */}
              <div className="flex-shrink-0 md:w-1/3 w-full">
                <img src={videoDetails?.thumbnail} className="rounded-lg w-full object-cover" alt={videoDetails?.title || "Video thumbnail"} />
              </div>

              {/* Video Info & Tabs */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{videoDetails?.title || "Video summary"}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{videoDetails?.channel || "Unknown channel"}</p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <Download size={16} />
                      Export
                    </button>
                    <button onClick={copyTabContent} className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>

                {/* TABS */}
                <div className="flex flex-wrap gap-3">
                  {["summary", "keypoints", "quotes", "transcript"].map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg capitalize transition ${tab === t ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT */}
                <div className="flex-1 max-w-full">
                  {tab === "summary" && <div className="p-5 rounded-lg bg-purple-50 dark:bg-purple-900/20 whitespace-pre-line">{aiSummary?.quickSummary || "No summary available."}</div>}

                  {tab === "keypoints" && (
                    <div className="space-y-3">
                      {(aiSummary?.keyPoints || []).map((point, i) => (
                        <div key={i} className="flex gap-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="w-7 h-7 flex items-center justify-center bg-purple-600 text-white rounded-full text-sm">{i + 1}</div>
                          <p className="break-words">{point}</p>
                        </div>
                      ))}
                      {(!aiSummary?.keyPoints || aiSummary.keyPoints.length === 0) && <p className="text-gray-500">No key points available.</p>}
                    </div>
                  )}

                  {tab === "quotes" && (
                    <div className="space-y-4">
                      {(aiSummary?.importantQuotes || []).map((q, i) => (
                        <div key={i} className="border-l-4 border-purple-600 pl-4 italic break-words">{q}</div>
                      ))}
                      {(!aiSummary?.importantQuotes || aiSummary.importantQuotes.length === 0) && <p className="text-gray-500">No quotes available.</p>}
                    </div>
                  )}

                  {tab === "transcript" && (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-h-[400px] overflow-y-auto whitespace-pre-line break-words">
                      {aiSummary?.fullTranscript || "No transcript available."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!summarized && !summarizing && (
          <div className="text-center py-20">
            <Youtube size={60} className="mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-semibold mb-2">Ready to summarize a video?</h3>
            <p className="text-gray-500">Paste a YouTube link above to generate a summary</p>
          </div>
        )}
      </main>
    </div>
  );
}
