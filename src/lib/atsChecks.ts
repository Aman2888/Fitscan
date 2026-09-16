import type { ChecklistItem } from "./types";

// This file intentionally contains ZERO calls to any AI model. Everything
// here is deterministic logic regexes, counts, and PDF geometry so it
// runs instantly, costs nothing, and gives the exact same answer every time
// for the same input. It's the product's answer to "isn't this just a
// ChatGPT wrapper?": these checks encode recruiter know-how directly, not a
// prompt.

const STRONG_ACTION_VERBS = [
  "developed", "led", "built", "managed", "designed", "implemented",
  "created", "improved", "increased", "reduced", "coordinated", "launched",
  "delivered", "optimized", "automated", "architected", "migrated",
  "mentored", "negotiated", "sourced", "recruited", "screened", "organized",
  "analyzed", "executed", "established",
];

export function runRecruiterChecklist(
  resumeText: string,
  jobDescription: string
): ChecklistItem[] {
  const text = resumeText;
  const lower = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const items: ChecklistItem[] = [];

  // 1. Contact info
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s-]{7,}\d)/.test(text);
  items.push({
    label: "Contact info present",
    passed: hasEmail && hasPhone,
    detail:
      hasEmail && hasPhone
        ? "Email and phone number were both found."
        : `Missing ${!hasEmail ? "an email address" : ""}${
            !hasEmail && !hasPhone ? " and " : ""
          }${!hasPhone ? "a phone number" : ""}. Both should be easy to find near the top.`,
  });

  // 2. Length
  const lengthOk = wordCount >= 250 && wordCount <= 1100;
  items.push({
    label: "Resume length",
    passed: lengthOk,
    detail: lengthOk
      ? `${wordCount} words a reasonable one-to-two page length.`
      : wordCount < 250
      ? `Only ${wordCount} words this reads as too thin for most roles.`
      : `${wordCount} words likely running past two pages, which recruiters tend to skim past.`,
  });

  // 3. Quantified achievements
  const quantified =
    /\d+(\.\d+)?\s?%|\$\s?\d+|\b\d{2,}\+?\s*(years?|clients?|users?|projects?|candidates?|engineers?)/gi;
  const quantMatches = text.match(quantified) ?? [];
  items.push({
    label: "Quantified achievements",
    passed: quantMatches.length >= 2,
    detail:
      quantMatches.length >= 2
        ? `Found ${quantMatches.length} numbers/metrics backing up claims (e.g. "${quantMatches[0]}").`
        : "Few or no numbers found. Claims land better when backed by a percentage, a count, or a timeframe.",
  });

  // 4. Strong action verbs
  const verbHits = STRONG_ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(lower)
  ).length;
  items.push({
    label: "Strong action verbs",
    passed: verbHits >= 4,
    detail:
      verbHits >= 4
        ? `${verbHits} strong action verbs found (developed, led, built, etc.).`
        : `Only ${verbHits} strong action verbs found. Bullets that open with one read faster to a recruiter scanning quickly.`,
  });

  // 5. No first-person language
  const pronounHits = (text.match(/\b(I|I've|I'm|my|me)\b/g) ?? []).length;
  items.push({
    label: "No first-person language",
    passed: pronounHits === 0,
    detail:
      pronounHits === 0
        ? "No first-person pronouns found matches standard resume convention."
        : `Found ${pronounHits} instance(s) of "I"/"my"/"me". Most resumes drop these entirely.`,
  });

  // 6. Job title echoed from the JD
  const titleMatch = jobDescription.match(
    /(?:hiring|looking for|seeking)\s+(?:a|an)?\s*([A-Z][\w\s/-]{2,40})/i
  );
  const likelyTitle = titleMatch?.[1]?.trim();
  const titleFound = likelyTitle
    ? likelyTitle
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .some((w) => lower.includes(w))
    : null;
  items.push({
    label: "Job title reflected in resume",
    passed: titleFound === true,
    detail:
      titleFound === true
        ? `Resume language overlaps with the role title ("${likelyTitle}").`
        : titleFound === false
        ? `Couldn't find "${likelyTitle}" or a close variant anywhere in the resume.`
        : "Couldn't confidently detect a job title in the description to compare against.",
  });

  return items;
}

// --- Document structure analysis (runs on the actual PDF, not the AI) ---

interface PdfPageLike {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: unknown[] }>;
}

interface PdfDocumentLike {
  numPages: number;
  getPage: (n: number) => Promise<PdfPageLike>;
}

interface TextItemLike {
  str?: string;
  transform: number[];
}

function isTextItem(item: unknown): item is TextItemLike {
  return (
    typeof item === "object" &&
    item !== null &&
    Array.isArray((item as { transform?: unknown }).transform)
  );
}

export async function detectDocumentStructureFlags(
  pdf: PdfDocumentLike
): Promise<string[]> {
  const flags: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const { items: rawItems } = await page.getTextContent();
    const items = rawItems.filter(isTextItem);

    const totalChars = items.reduce((sum, it) => sum + (it.str?.length ?? 0), 0);
    if (totalChars < 20) {
      flags.push(
        `Page ${i} has almost no extractable text it may be an image or scan, which most ATS software can't read at all.`
      );
      continue;
    }

    // Bucket text items into rows by y-position, then check whether any row
    // has items both well left-of-center and well right-of-center a sign
    // of a two-column layout. ATS parsers read left-to-right across the
    // full line and often scramble columns into the wrong order.
    const pageWidth = viewport.width;
    const rows = new Map<number, number[]>();
    for (const it of items) {
      const x = it.transform[4];
      const y = Math.round(it.transform[5] / 4) * 4;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push(x);
    }

    let twoColumnRows = 0;
    for (const xs of rows.values()) {
      const hasLeft = xs.some((x) => x < pageWidth * 0.42);
      const hasRight = xs.some((x) => x > pageWidth * 0.55);
      if (hasLeft && hasRight) twoColumnRows++;
    }

    if (twoColumnRows > 6) {
      flags.push(
        `Page ${i} looks like a multi-column layout. Many ATS parsers misread multi-column text as jumbled or out of order.`
      );
    }
  }

  return flags;
}
