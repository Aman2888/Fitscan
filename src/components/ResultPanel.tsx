import { CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

export default function ResultPanel({ result }: { result: AnalysisResult }) {
  const scoreColor =
    result.matchScore >= 75 ? "text-match" : result.matchScore >= 50 ? "text-ink" : "text-gap";

  return (
    <div className="border-t border-ink pt-10">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">Match score</p>
          <p className={`font-display text-6xl font-semibold ${scoreColor}`}>
            {result.matchScore}%
          </p>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-soft md:text-right">
          {result.summary}
        </p>
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

      {result.formattingFlags.length > 0 && (
        <div className="mt-10">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <AlertTriangle size={18} className="text-ink-soft" />
            Formatting flags
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
