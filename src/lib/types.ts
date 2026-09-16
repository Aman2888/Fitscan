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
