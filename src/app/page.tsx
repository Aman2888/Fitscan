import Link from "next/link";
import { ArrowUpRight, FileText, ScanLine, ListChecks } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-semibold tracking-tight">
          Fitscan
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/recruiter"
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            For recruiters
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-ink px-4 py-1.5 text-sm hover:bg-ink hover:text-paper-raised transition-colors"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 pt-12 pb-24 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Your resume, read the way a machine reads it.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft leading-relaxed">
            Before a recruiter ever opens your resume, software scores it against
            the job description. Fitscan runs that same check, so you know what
            to fix before you hit apply.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-paper-raised text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              Scan a resume
              <ArrowUpRight size={16} />
            </Link>
            <span className="text-sm text-ink-soft">No signup for your first scan</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-4 -top-4 h-full w-full rounded-sm border border-line bg-paper-raised/40" />
          <div className="relative rounded-sm border border-line bg-paper-raised p-8 shadow-[0_1px_0_0_rgba(22,26,35,0.06)]">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2 text-ink-soft">
                <FileText size={16} />
                <span className="font-mono text-xs">resume_final_v3.pdf</span>
              </div>
              <ScanLine size={16} className="text-match" />
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="h-2.5 w-4/5 rounded-full bg-line" />
              <div className="h-2.5 w-full rounded-full bg-match-soft" />
              <div className="h-2.5 w-3/5 rounded-full bg-line" />
              <div className="h-2.5 w-full rounded-full bg-gap-soft" />
              <div className="h-2.5 w-2/3 rounded-full bg-match-soft" />
              <div className="h-2.5 w-4/5 rounded-full bg-line" />
            </div>

            <div className="mt-8 flex items-end justify-between border-t border-line pt-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  Match score
                </p>
                <p className="font-display text-4xl font-semibold text-match">
                  78%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-soft">6 keywords missing</p>
                <p className="text-xs text-ink-soft">2 formatting flags</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-raised/50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                n: "1",
                title: "Paste the job description",
                body: "Drop in the listing you're applying to, or paste the raw text directly.",
              },
              {
                n: "2",
                title: "Upload your resume",
                body: "PDF or plain text. Fitscan reads it exactly as most applicant tracking systems do.",
              },
              {
                n: "3",
                title: "Get a scored breakdown",
                body: "A match percentage, the exact keywords you're missing, and what to change first.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t border-ink pt-4">
                <span className="font-mono text-sm text-ink-soft">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator: not just an LLM wrapper */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold">More than a prompt</h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-soft leading-relaxed">
            Two parts of every scan don&apos;t touch an AI model at all they run as plain
            deterministic code, so they give the exact same answer every time.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="border-t border-ink pt-4">
              <span className="font-mono text-xs text-ink-soft">rule-based</span>
              <h3 className="mt-3 font-display text-lg font-semibold">Recruiter checklist</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Contact info, resume length, quantified achievements, action verbs, first-person
                language, title match encoded directly from real recruiting practice, not
                asked of a language model.
              </p>
            </div>
            <div className="border-t border-ink pt-4">
              <span className="font-mono text-xs text-ink-soft">document structure</span>
              <h3 className="mt-3 font-display text-lg font-semibold">Document structure check</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Reads the actual text positions inside your PDF to catch multi-column layouts and
                scanned/image pages the layout mistakes that silently break real ATS parsers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <ListChecks className="mx-auto text-match" size={28} />
        <h2 className="mx-auto mt-6 max-w-xl font-display text-3xl font-semibold leading-tight">
          Stop guessing why the callback never came.
        </h2>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-paper-raised text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Run your first scan
          <ArrowUpRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        Built with Next.js, Tailwind, and the Claude API.
      </footer>
    </div>
  );
}
