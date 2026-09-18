import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/prompts";
import type { AnalysisResult } from "@/lib/types";

const GEMINI_MODEL = "gemini-3.5-flash-lite";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string, apiKey: string) {
  const maxRetries = 3;
  let lastErrorText = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        }),
      }
    );

    if (response.ok) {
      return response;
    }

    lastErrorText = await response.text();

    // A daily quota being fully exhausted won't fix itself with a retry 
    // it only resets at midnight Pacific. Fail fast with a clear message
    // instead of burning retries on something retrying can't solve.
    const isDailyQuotaExhausted = /PerDay/i.test(lastErrorText);
    if (isDailyQuotaExhausted) {
      throw new Error(
        "Daily free-tier quota for this model is used up for today. It resets at midnight Pacific time try again later, or switch to a different Gemini model/key."
      );
    }

    // 503 = model temporarily overloaded, 429 = short-term rate limit.
    // Both are worth a short retry; anything else fails immediately.
    const retryable = response.status === 503 || response.status === 429;
    if (!retryable || attempt === maxRetries) {
      console.error(`Gemini API error (attempt ${attempt + 1}):`, lastErrorText);
      throw new Error(lastErrorText);
    }

    const delay = 1000 * 2 ** attempt; // 1s, 2s, 4s
    console.warn(`Gemini overloaded, retrying in ${delay}ms (attempt ${attempt + 1})`);
    await sleep(delay);
  }

  throw new Error(lastErrorText);
}

export async function POST(req: NextRequest) {
  const { jobDescription, resumeText } = await req.json();

  if (!jobDescription || !resumeText) {
    return NextResponse.json(
      { error: "jobDescription and resumeText are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  try {
    const response = await callGemini(
      buildAnalysisPrompt(jobDescription, resumeText),
      apiKey
    );

    const data = await response.json();
    const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const result: AnalysisResult = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    console.error("Analyze route error:", detail);
    return NextResponse.json(
      { error: "AI request failed after retries", detail },
      { status: 502 }
    );
  }
}
