"use client";
import { useContext, useMemo, useState } from "react";
import { appcontext } from "@/app/context/appcontext";
import Link from "next/link";

export default function WebsiteGeneratorPage() {
  const { api } = useContext(appcontext);

  const [prompt, setPrompt] = useState("");
  const [websiteType, setWebsiteType] = useState("landing");
  const [colorTheme, setColorTheme] = useState("purple");
  const [fontStyle, setFontStyle] = useState("modern");

  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isQuota, setIsQuota] = useState(false);

  const getPreviewHTML = (code) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body{
          font-family: 'Inter', sans-serif;
          margin:0;
          padding:0;
        }
      </style>
    </head>
    <body>
      ${code}
    </body>
    </html>
    `;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");
    setIsUnauthorized(false);
    setIsQuota(false);
    setGeneratedCode("");

    try {
      const response = await fetch(`${api}/ai/website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: websiteType,
          theme: colorTheme,
          font: fontStyle,
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsUnauthorized(true);
        }

        if (response.status === 403) {
          setIsQuota(true);
        }

        setError(data.message || "Failed to generate website");
        return;
      }

      if (data.success) {
        setGeneratedCode(data.code || "");
      } else {
        setError(data.message || "Website generation failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openFullPreview = () => {
    const blob = new Blob([getPreviewHTML(generatedCode)], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };

  const previewHTML = useMemo(() => getPreviewHTML(generatedCode), [generatedCode]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Website Generator
        </h1>

        <p className="text-gray-600">
          Build complete responsive websites instantly with AI
        </p>
      </div>

      {/* Error */}

      {(error || isUnauthorized || isQuota) && (
        <div className="mb-6 border border-gray-200 rounded-xl bg-red-50 text-red-600 px-4 py-3 flex justify-between items-center">
          <span>{error}</span>

          {isUnauthorized && (
            <Link
              href="/auth/signin"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Login
            </Link>
          )}

          {isQuota && (
            <Link
              href="/user/dashboard/pricing"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Upgrade
            </Link>
          )}
        </div>
      )}

      {/* Generator Card */}

      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 mb-8">
        <label className="block text-sm font-medium mb-2">
          Describe your website
        </label>

        <textarea
          placeholder="Example: SaaS landing page for AI startup"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-3 h-[110px] resize-none focus:outline-none"
        />

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {/* Website Type */}

          <div>
            <label className="block text-sm mb-2">Website Type</label>

            <select
              value={websiteType}
              onChange={(e) => setWebsiteType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2"
            >
              <option value="portfolio">Portfolio</option>
              <option value="startup">Startup</option>
              <option value="saas">SaaS</option>
              <option value="blog">Blog</option>
              <option value="landing">Landing Page</option>
            </select>
          </div>

          {/* Theme */}

          <div>
            <label className="block text-sm mb-2">Color Theme</label>

            <select
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2"
            >
              <option value="purple">Purple</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="pink">Pink</option>
            </select>
          </div>

          {/* Font */}

          <div>
            <label className="block text-sm mb-2">Font Style</label>

            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="mt-6 w-full h-12 text-white font-medium rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-50"
        >
          {isGenerating ? "Generating Website..." : "Generate Website"}
        </button>
      </div>

      {/* Generated Result */}

      {generatedCode && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Live Preview</h3>

              <button
                onClick={openFullPreview}
                className="border border-gray-200 px-3 py-1 rounded text-sm"
              >
                Open Full Preview
              </button>
            </div>

            <iframe
              srcDoc={previewHTML}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-[600px] border border-gray-200 rounded-lg"
            />
          </div>

          {/* Code */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Source Code</h3>

              <button
                className="border border-gray-200 px-3 py-1 rounded text-sm"
                onClick={() => navigator.clipboard.writeText(generatedCode)}
              >
                Copy Code
              </button>
            </div>

            <div className="bg-black text-green-400 rounded-lg p-4 overflow-auto h-[600px] text-sm border border-gray-200">
              <pre>{generatedCode}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
