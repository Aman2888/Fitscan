export function buildAnalysisPrompt(jobDescription: string, resumeText: string) {
  return `You are an ATS (Applicant Tracking System) simulator and resume coach.
Compare the resume against the job description exactly as automated screening
software would, then coach the candidate on what to change.

JOB DESCRIPTION:
"""
${jobDescription}
"""

RESUME:
"""
${resumeText}
"""

Respond with ONLY a JSON object (no markdown fences, no preamble) matching this
exact shape:

{
  "matchScore": <integer 0-100, overall fit>,
  "summary": "<one or two plain-English sentences on overall fit>",
  "missingKeywords": ["<important terms/skills from the JD absent from the resume>"],
  "matchedKeywords": ["<important terms/skills from the JD present in the resume>"],
  "formattingFlags": ["<ATS-unfriendly formatting issues you can infer from the text alone (e.g. missing standard section headers, unconventional section names, icons/symbols likely to break text extraction). Where relevant, name which real ATS platforms this specifically affects Workday, Taleo, and iCIMS are strict and fail hard on non-standard formatting; Greenhouse is more forgiving; Lever silently drops content rather than erroring. Empty array if none.>"],
  "suggestions": ["<3-6 concrete, specific edits the candidate should make, ordered by impact>"]
}`;
}
