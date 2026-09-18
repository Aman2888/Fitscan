import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ClipboardCheck,
  FileSearch,
} from "lucide-react";
import type { AnalysisResult, ChecklistItem } from "@/lib/types";
import { computeHybridScore } from "@/lib/scoring";

interface ResultPanelProps {
  result: AnalysisResult;
  checklist?: ChecklistItem[];
  documentFlags?: string[];
  showDocumentSection?: boolean;
}

export default function ResultPanel({
  result,
  checklist = [],
  documentFlags = [],
  showDocumentSection = false,
}: ResultPanelProps) {
  const { finalScore, components } = computeHybridScore(
    result,
    checklist,
    documentFlags,
    showDocumentSection
  );
  const scoreColor =
    finalScore >= 75 ? "text-match" : finalScore >= 50 ? "text-ink" : "text-gap";

  return (
    <div className="border-t border-ink pt-10">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">Fitscan score</p>
          <p className={`font-display text-6xl font-semibold ${scoreColor}`}>
            {finalScore}%
          </p>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-soft md:text-right">
          {result.summary}
        </p>
      </div>

      {/* The formula, visible not a single opaque AI number */}
      <div className="mt-8 space-y-3">
        {components.map((c) => (
          <div key={c.label}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-ink">
                {c.label}{" "}
                <span className="font-mono text-ink-soft">
                  · {Math.round(c.weight * 100)}% weight
                </span>
              </span>
              <span className="font-mono text-ink-soft">{Math.round(c.score)}/100</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-ink"
                style={{ width: `${Math.round(c.score)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink-soft">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <CheckCircle2 size={18} className="text-match" />
            Keywords you have
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-match-soft px-3 py-1 text-xs text-match"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <XCircle size={18} className="text-gap" />
            Keywords you&apos;re missing
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.missingKeywords.map((kw) => (
              <span key={kw} className="rounded-full bg-gap-soft px-3 py-1 text-xs text-gap">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {checklist.length > 0 && (
        <div className="mt-14 border-t border-line pt-10">
          <div className="flex items-baseline justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <ClipboardCheck size={18} className="text-ink" />
              Recruiter checklist
            </h3>
            <span className="font-mono text-xs text-ink-soft">rule-based, not AI</span>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Deterministic checks encoding what recruiters actually look for same input, same
            answer, every time.
          </p>
          <ul className="mt-5 space-y-4">
            {checklist.map((item) => (
              <li key={item.label} className="flex gap-3">
                {item.passed ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-match" />
                ) : (
                  <XCircle size={16} className="mt-0.5 shrink-0 text-gap" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-ink-soft">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDocumentSection && (
        <div className="mt-14 border-t border-line pt-10">
          <div className="flex items-baseline justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <FileSearch size={18} className="text-ink" />
              Document structure check
            </h3>
            <span className="font-mono text-xs text-ink-soft">read from the PDF itself</span>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Analyzed the actual text positions in your PDF not a guess from the AI.
          </p>
          {documentFlags.length > 0 ? (
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              {documentFlags.map((flag) => (
                <li key={flag} className="border-l-2 border-gap pl-3">
                  {flag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 flex items-center gap-2 text-sm text-match">
              <CheckCircle2 size={16} />
              No structural issues found single column, no scanned pages detected.
            </p>
          )}
        </div>
      )}

      {result.formattingFlags.length > 0 && (
        <div className="mt-10">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <AlertTriangle size={18} className="text-ink-soft" />
            AI-assessed formatting notes
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {result.formattingFlags.map((flag) => (
              <li key={flag} className="border-l-2 border-line pl-3">
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Lightbulb size={18} className="text-ink-soft" />
          What to fix first
        </h3>
        <ol className="mt-4 space-y-3">
          {result.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-mono text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
