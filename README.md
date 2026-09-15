# Fitscan Resume ↔ Job Description Matcher

Paste a job description and a resume, get an ATS-style match score, missing
keywords, formatting flags, and concrete fix suggestions powered by the
Claude API.

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Google Gemini API (`gemini-2.5-flash`) for the analysis free tier, no credit card
- `pdf-parse` for reading uploaded PDFs
- `lucide-react` for icons

### Why Gemini instead of the Claude API
The Claude API has no permanent free tier (just a one-time trial credit), so
this project uses Gemini's free tier instead good enough for a portfolio
demo that recruiters can actually click through without you paying per scan.
Swapping back to Claude later is a ~15 line change in
`src/app/api/analyze/route.ts` (see the git history / comments there) if you
want production-grade analysis once you're monetizing this.

## Project structure
```
src/
  app/
    page.tsx                 → landing page
    dashboard/page.tsx        → main tool (upload + results)
    api/analyze/route.ts      → calls Claude, returns structured JSON
    api/extract-pdf/route.ts  → extracts text from uploaded PDF
  components/
    ResultPanel.tsx           → renders the score/keywords/suggestions
  lib/
    prompts.ts                → the Claude prompt template
    types.ts                  → shared AnalysisResult type
```

## Setup
```bash
npm install
cp .env.local.example .env.local   # then add your GEMINI_API_KEY
npm run dev
```
Get a free key at https://aistudio.google.com/apikey (Google account, no
credit card, no phone verification). Free-tier rate limits apply plenty
for a portfolio demo.

Open http://localhost:3000

## Where to go next (Phase 2/3 from the plan)
- **Auth**: add NextAuth.js so scans are tied to a user.
- **History**: add Supabase/Postgres, save each `AnalysisResult` with a
  `user_id` and `created_at`, list past scans on the dashboard.
- **Charts**: once history exists, plot score-over-time with Recharts.
- **Export**: add a "Download report as PDF" button on `ResultPanel`.
- **Rate limiting**: cap free scans per day (e.g. with Upstash Redis).

## Deploying
Push to GitHub, import into Vercel, add `GEMINI_API_KEY` in the project's
Environment Variables, deploy.
