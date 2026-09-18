export interface AnalysisResult {
  matchScore: number;
  summary: string;
  missingKeywords: string[];
  matchedKeywords: string[];
  formattingFlags: string[];
  suggestions: string[];
}

export interface ChecklistItem {
  label: string;
  passed: boolean;
  detail: string;
}

export interface CandidateResult {
  id: string;
  fileName: string;
  resumeText: string;
  analysis: AnalysisResult | null;
  checklist: ChecklistItem[];
  documentFlags: string[];
  isPdf: boolean;
  status: "pending" | "scanning" | "done" | "error";
  error?: string;
}
