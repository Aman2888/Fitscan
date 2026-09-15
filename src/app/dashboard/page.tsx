"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, FileUp, X } from "lucide-react";
import ResultPanel from "@/components/ResultPanel";
import type { AnalysisResult } from "@/lib/types";

export default function DashboardPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      setResumeText(data.text ?? "");
    } else {
      const text = await file.text();
      setResumeText(text);
    }
  }

  async function handleAnalyze() {
    setError(null);
    if (!jobDescription.trim() || !resumeText.trim()) {
      setError("Add both a job description and a resume before scanning.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resumeText }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong while scanning. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={16} />
          Fitscan
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-24 md:grid-cols-2">
        {/* Job description */}
        <div>
          <label className="text-sm font-medium text-ink">Job description</label>
          <p className="mt-1 text-xs text-ink-soft">Paste the full listing, requirements included.</p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="mt-3 h-64 w-full resize-none rounded-sm border border-line bg-paper-raised p-4 text-sm leading-relaxed outline-none focus:border-ink"
          />
        </div>

        {/* Resume */}
        <div>
          <label className="text-sm font-medium text-ink">Your resume</label>
          <p className="mt-1 text-xs text-ink-soft">Upload a PDF, or paste the text directly.</p>

          <label className="mt-3 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-line bg-paper-raised text-sm text-ink-soft hover:border-ink hover:text-ink transition-colors">
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {fileName ? (
              <span className="flex items-center gap-2">
                <FileUp size={16} />
                {fileName}
                <X
                  size={14}
                  onClick={(e) => {
                    e.preventDefault();
                    setFileName(null);
                    setResumeText("");
                  }}
                  className="hover:text-gap"
                />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileUp size={16} />
                Click to upload a PDF
              </span>
            )}
          </label>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="...or paste resume text here"
            className="mt-3 h-36 w-full resize-none rounded-sm border border-line bg-paper-raised p-4 text-sm leading-relaxed outline-none focus:border-ink"
          />
        </div>
      </main>

      <div className="mx-auto max-w-6xl px-6">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper-raised hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Scanning..." : "Run scan"}
        </button>
        {error && <p className="mt-3 text-sm text-gap">{error}</p>}
      </div>

      {result && (
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
          <ResultPanel result={result} />
        </div>
      )}
    </div>
  );
}
