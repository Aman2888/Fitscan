"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  FileUp,
  X,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { runRecruiterChecklist } from "@/lib/atsChecks";
import type { CandidateResult } from "@/lib/types";

export default function RecruiterModePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const MAX_CANDIDATES = 8;

  async function handleFiles(files: FileList) {
    setError(null);
    const incoming = Array.from(files).slice(0, MAX_CANDIDATES - candidates.length);
    if (incoming.length === 0) return;

    const newCandidates: CandidateResult[] = [];
    for (const file of incoming) {
      let text = "";
      let documentFlags: string[] = [];
      if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
        const data = await res.json();
        text = data.text ?? "";
        documentFlags = data.documentFlags ?? [];
      } else {
        text = await file.text();
      }
      newCandidates.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        resumeText: text,
        analysis: null,
        checklist: [],
        documentFlags,
        status: "pending",
      });
    }
    setCandidates((prev) => [...prev, ...newCandidates]);
  }

  function removeCandidate(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  async function runBatch() {
    setError(null);
    if (!jobDescription.trim()) {
      setError("Add a job description before running the batch scan.");
      return;
    }
    if (candidates.length === 0) {
      setError("Upload at least one resume.");
      return;
    }

    setRunning(true);

    // Sequential, not parallel the free Gemini tier is rate-limited per
    // minute, and running candidates one at a time keeps this safely under
    // that limit regardless of batch size.
    for (const candidate of candidates) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, status: "scanning" } : c))
      );

      const checklist = runRecruiterChecklist(candidate.resumeText, jobDescription);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription, resumeText: candidate.resumeText }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || data.error || "Scan failed");
        }
        const analysis = await res.json();
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id ? { ...c, analysis, checklist, status: "done" } : c
          )
        );
      } catch (err) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id
              ? {
                  ...c,
                  analysis: null,
                  checklist,
                  status: "error",
                  error: err instanceof Error ? err.message : "Scan failed",
                }
              : c
          )
        );
      }

      // Small gap between candidates kinder to the free-tier rate limit
      // than firing requests back-to-back.
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    setRunning(false);
  }

  const ranked = [...candidates].sort((a, b) => {
    const scoreA = a.analysis?.matchScore ?? -1;
    const scoreB = b.analysis?.matchScore ?? -1;
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={16} />
          Fitscan
        </Link>
        <span className="font-mono text-xs text-ink-soft">Recruiter mode</span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <h1 className="font-display text-3xl font-semibold">Screen candidates in bulk</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft leading-relaxed">
          One job description, up to {MAX_CANDIDATES} resumes. Fitscan ranks every candidate by
          match score so you can triage a stack of applicants in one pass.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Job description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="mt-3 h-48 w-full resize-none rounded-sm border border-line bg-paper-raised p-4 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">
              Resumes ({candidates.length}/{MAX_CANDIDATES})
            </label>
            <label className="mt-3 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-line bg-paper-raised text-sm text-ink-soft hover:border-ink hover:text-ink transition-colors">
              <input
                type="file"
                accept=".pdf,.txt"
                multiple
                className="hidden"
                disabled={candidates.length >= MAX_CANDIDATES}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <FileUp size={16} />
              Click to upload resumes (PDF or text)
            </label>

            {candidates.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {candidates.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-sm border border-line bg-paper-raised px-3 py-2 text-xs"
                  >
                    <span className="truncate">{c.fileName}</span>
                    <X
                      size={14}
                      onClick={() => removeCandidate(c.id)}
                      className="shrink-0 cursor-pointer text-ink-soft hover:text-gap"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={runBatch}
          disabled={running}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper-raised hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {running && <Loader2 size={16} className="animate-spin" />}
          {running ? "Scanning candidates..." : "Run batch scan"}
        </button>
        {error && <p className="mt-3 text-sm text-gap">{error}</p>}

        {candidates.length > 0 && (
          <div className="mt-14 border-t border-ink pt-8">
            <h2 className="font-display text-xl font-semibold">Ranked results</h2>
            <div className="mt-6 space-y-2">
              {ranked.map((c, i) => (
                <div key={c.id} className="rounded-sm border border-line bg-paper-raised">
                  <button
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-ink-soft">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium">{c.fileName}</span>
                      {c.status === "scanning" && (
                        <Loader2 size={14} className="animate-spin text-ink-soft" />
                      )}
                      {c.status === "error" && (
                        <span className="text-xs text-gap">{c.error}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {c.analysis && (
                        <span
                          className={`font-display text-lg font-semibold ${
                            c.analysis.matchScore >= 75
                              ? "text-match"
                              : c.analysis.matchScore >= 50
                              ? "text-ink"
                              : "text-gap"
                          }`}
                        >
                          {c.analysis.matchScore}%
                        </span>
                      )}
                      {c.checklist.length > 0 && (
                        <span className="font-mono text-xs text-ink-soft">
                          {c.checklist.filter((item) => item.passed).length}/
                          {c.checklist.length} checklist
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={`text-ink-soft transition-transform ${
                          expandedId === c.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedId === c.id && c.analysis && (
                    <div className="border-t border-line px-4 py-4">
                      <p className="text-sm text-ink-soft">{c.analysis.summary}</p>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                            Missing keywords
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {c.analysis.missingKeywords.map((kw) => (
                              <span
                                key={kw}
                                className="rounded-full bg-gap-soft px-2 py-0.5 text-xs text-gap"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                            Checklist
                          </p>
                          <ul className="mt-2 space-y-1">
                            {c.checklist.map((item) => (
                              <li key={item.label} className="flex items-center gap-2 text-xs">
                                {item.passed ? (
                                  <CheckCircle2 size={12} className="text-match" />
                                ) : (
                                  <XCircle size={12} className="text-gap" />
                                )}
                                {item.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {c.documentFlags.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                            Document structure
                          </p>
                          <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                            {c.documentFlags.map((flag) => (
                              <li key={flag}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
