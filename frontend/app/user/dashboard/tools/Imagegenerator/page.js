"use client";

import { useContext, useState } from "react";
import { appcontext } from "@/app/context/appcontext";
import Link from "next/link";

// ---------- REUSABLE COMPONENTS ----------
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

// ---------- MAIN PAGE ----------
export default function ImageGeneratorPage() {
  const { api} = useContext(appcontext);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState("1");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isQuota, setIsQuota] = useState(false);

  const handleGenerate = async () => {
  if (!prompt.trim()) {
    setError("Please enter a prompt.");
    return;
  }

  if (!api) {
    setError("API URL is not defined.");
    return;
  }

  setLoading(true);
  setError("");
  setIsUnauthorized(false);
  setIsQuota(false);

  try {
    const res = await fetch(`${api}/ai/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        prompt,
        style,
        count: parseInt(numImages),
        aspect: aspectRatio,
      }),
    });

    let data = {};

    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      console.error("Raw response:", text);
    }

    // ❌ REQUEST FAILED
    if (!res.ok) {
      if (res.status === 401) {
        setIsUnauthorized(true);
      }

      if (res.status === 403 || /quota/i.test(data?.message || "")) {
        setIsQuota(true);
      }

      setError(data?.message || `Server error ${res.status}`);
      setGeneratedImages([]);
      return; // 🔥 IMPORTANT
    }

    // ❌ INVALID RESPONSE
    if (!Array.isArray(data?.images)) {
      setError("Failed to generate images.");
      setGeneratedImages([]);
      return;
    }

    // ✅ SUCCESS
    setGeneratedImages(data.images);

  } catch (err) {
    console.error("Image generation error:", err);
    setError(err.message || "Failed to generate images.");
    setGeneratedImages([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            AI Image Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
            Create stunning visuals from text descriptions using advanced AI
          </p>
        </div>

        {/* ERROR / LOGIN / QUOTA MESSAGE */}
        {(error || isUnauthorized || isQuota) && (
          <div className="px-4 mb-4">
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

        {/* INPUT CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-8 sm:mb-10">
          {/* PROMPT */}
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Describe your image
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a description..."
            className="w-full border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg p-3 sm:p-4 h-28 sm:h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* OPTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option value="realistic">Realistic</option>
                <option value="anime">Anime</option>
                <option value="3d">3D Render</option>
                <option value="illustration">Illustration</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Number of Images</label>
              <select
                value={numImages}
                onChange={(e) => setNumImages(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option value="1">1 Image</option>
                <option value="2">2 Images</option>
                <option value="3">3 Images</option>
                <option value="4">4 Images</option>
              </select>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-6 py-3 sm:py-3.5 text-white font-medium rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition active:scale-95"
          >
            {loading ? "Generating..." : "✨ Generate Images"}
          </Button>
        </div>

        {/* GENERATED IMAGES */}
        {generatedImages?.length > 0 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Generated Images
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {generatedImages?.map((img, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition overflow-hidden group">
                  <div className="relative">
                    <img
                      src={img}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-56 sm:h-60 md:h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <a href={img} target="_blank" rel="noopener noreferrer" className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-200">
                        Download
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(img)}
                        className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-200"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {generatedImages?.length === 0 && !loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center text-2xl sm:text-3xl">
              ✨
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Ready to create amazing images?
            </h3>
            <p className="text-gray-500 dark:text-gray-300 mt-2 text-sm sm:text-base">
              Enter a description above and click generate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
