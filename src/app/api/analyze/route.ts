// import { NextRequest, NextResponse } from "next/server";
// import { buildAnalysisPrompt } from "@/lib/prompts";
// import type { AnalysisResult } from "@/lib/types";

// const GEMINI_MODEL = "gemini-2.5-flash";

// export async function POST(req: NextRequest) {
//   const { jobDescription, resumeText } = await req.json();

//   if (!jobDescription || !resumeText) {
//     return NextResponse.json(
//       { error: "jobDescription and resumeText are required" },
//       { status: 400 }
//     );
//   }

//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json(
//       { error: "GEMINI_API_KEY is not set on the server" },
//       { status: 500 }
//     );
//   }

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-goog-api-key": apiKey,
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: buildAnalysisPrompt(jobDescription, resumeText) }],
//             },
//           ],
//           generationConfig: {
//             // Ask Gemini to return raw JSON directly, no markdown fences.
//             responseMimeType: "application/json",
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errText = await response.text();
//       console.error("Gemini API error:", errText);
//       return NextResponse.json({ error: "AI request failed" }, { status: 502 });
//     }

//     const data = await response.json();
//     const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
//     const cleaned = rawText.replace(/```json|```/g, "").trim();
//     const result: AnalysisResult = JSON.parse(cleaned);

//     return NextResponse.json(result);
//   } catch (err) {
//     console.error("Analyze route error:", err);
//     return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/prompts";
import type { AnalysisResult } from "@/lib/types";

const GEMINI_MODEL = "gemini-3.6-flash";

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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildAnalysisPrompt(jobDescription, resumeText) }],
            },
          ],
          generationConfig: {
            // Ask Gemini to return raw JSON directly, no markdown fences.
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { error: "AI request failed", detail: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const result: AnalysisResult = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}