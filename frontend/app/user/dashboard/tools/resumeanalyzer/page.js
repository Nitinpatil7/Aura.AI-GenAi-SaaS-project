"use client";

import { useCallback, useContext, useMemo, useState } from "react";
import { FileText, Loader2, RotateCcw, Upload } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const INVALID_RESUME_MESSAGE = "Please upload a valid resume file only.";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_MIME_TYPES = new Set(["application/pdf"]);
const colors = ["#7C3AED", "#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

function validateResumeFile(selectedFile) {
  if (!selectedFile) return INVALID_RESUME_MESSAGE;

  const fileName = selectedFile.name.toLowerCase();
  const isPdf = VALID_MIME_TYPES.has(selectedFile.type) || fileName.endsWith(".pdf");

  if (!isPdf) return INVALID_RESUME_MESSAGE;
  if (selectedFile.size > MAX_FILE_SIZE) return "Resume file must be 5MB or smaller.";

  return "";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function EmptyChart({ message = "No data returned for this section." }) {
  return (
    <div className="h-[220px] flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
      {message}
    </div>
  );
}

export default function ResumeAnalyzer() {
  const { api } = useContext(appcontext);

  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("Analyze this resume for ATS and role fit.");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleSelectedFile = useCallback((selectedFile) => {
    const validationError = validateResumeFile(selectedFile);

    if (validationError) {
      setFile(null);
      setAnalysis(null);
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
    setError("");
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      handleSelectedFile(event.target.files?.[0]);
      event.target.value = "";
    },
    [handleSelectedFile],
  );

  const handleAnalyze = useCallback(async () => {
    const validationError = validateResumeFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("prompt", prompt.trim());

      const res = await fetch(`${api}/ai/resume`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || INVALID_RESUME_MESSAGE);
      }

      if (!data?.result || typeof data.result !== "object") {
        throw new Error("Resume analysis returned no usable data.");
      }

      setAnalysis(data.result);
    } catch (err) {
      setError(err.message || "Resume analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [api, file, prompt]);

  const derived = useMemo(
    () => ({
      overallScore: Number(analysis?.overallScore) || 0,
      atsScore: Number(analysis?.atsScore) || 0,
      roles: normalizeArray(analysis?.roleProbability),
      skills: normalizeArray(analysis?.skillStrength),
      keywords: normalizeArray(analysis?.keywordDensity),
      projects: normalizeArray(analysis?.projectStrength),
      sections: analysis?.sections && typeof analysis.sections === "object" ? analysis.sections : {},
      suggestions: normalizeArray(analysis?.suggestions),
    }),
    [analysis],
  );

  const sectionData = useMemo(
    () =>
      Object.entries(derived.sections).map(([section, value]) => ({
        section,
        status: value ? 1 : 0,
        label: value ? "Present" : "Missing",
      })),
    [derived.sections],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Analyzer</h1>
          <p className="text-gray-500 mt-2">Upload a PDF resume for ATS, role-fit, and improvement insights.</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            disabled={analyzing}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
            placeholder="Analyze resume for a frontend developer role"
          />

          <div
            onDrop={(event) => {
              event.preventDefault();
              handleSelectedFile(event.dataTransfer.files?.[0]);
            }}
            onDragOver={(event) => event.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 md:p-14 text-center hover:border-purple-500 transition"
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="resumeUpload"
              disabled={analyzing}
            />

            <label htmlFor="resumeUpload" className="cursor-pointer block">
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-700">
                <Upload size={34} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {file ? file.name : "Upload Resume PDF"}
              </h3>
              <p className="text-gray-500 text-sm mt-1">Drag and drop or click to browse. PDF only, up to 5MB.</p>
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing && <Loader2 size={18} className="animate-spin" />}
            {analyzing ? "Analyzing resume..." : "Analyze Resume"}
          </button>

          {analyzing && (
            <p className="text-sm text-gray-500 text-center">
              Analysis can take a little time while the PDF text is extracted and scored.
            </p>
          )}
        </div>

        {analysis && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Overall Resume Score</h2>
                <div className="text-6xl font-bold text-purple-600">{derived.overallScore}</div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">ATS Score</h2>
                <div className="text-6xl font-bold text-blue-600">{derived.atsScore}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="Role Match Probability">
                {derived.roles.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={derived.roles}>
                      <XAxis dataKey="role" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="probability" fill="#10B981">
                        <LabelList dataKey="probability" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>

              <ChartCard title="Skill Strength">
                {derived.skills.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={derived.skills}>
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#3B82F6">
                        <LabelList dataKey="percentage" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>

              <ChartCard title="Project Strength">
                {derived.projects.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={derived.projects}>
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#F59E0B">
                        <LabelList dataKey="score" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>

              <ChartCard title="Keyword Density">
                {derived.keywords.length ? (
                  <div className="grid gap-3">
                    {derived.keywords.map((item, index) => (
                      <div key={`${item.keyword}-${index}`}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.keyword}</span>
                          <span>{item.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min((Number(item.count) || 0) * 10, 100)}%`,
                              backgroundColor: colors[index % colors.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>

              <ChartCard title="Resume Sections">
                {sectionData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart layout="vertical" data={sectionData}>
                      <XAxis type="number" domain={[0, 1]} hide />
                      <YAxis type="category" dataKey="section" width={120} />
                      <Tooltip formatter={(_, __, item) => item.payload.label} />
                      <Bar dataKey="status" fill="#6366F1">
                        <LabelList dataKey="label" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  AI Suggestions
                </h3>
                {derived.suggestions.length ? (
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    {derived.suggestions.map((suggestion, index) => (
                      <li key={`${suggestion}-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No suggestions returned.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setAnalysis(null);
                setError("");
              }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              <RotateCcw size={16} />
              Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
