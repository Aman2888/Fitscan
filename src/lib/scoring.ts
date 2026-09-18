import type { AnalysisResult, ChecklistItem } from "./types";
export interface ScoreComponent {
  label: string;
  score: number; // 0–100
  weight: number; // normalized so all components sum to 1
  detail: string;
}

export interface HybridScore {
  finalScore: number;
  components: ScoreComponent[];
}

const BASE_WEIGHTS = {
  ai: 0.5,
  checklist: 0.3,
  structure: 0.2,
};

export function computeHybridScore(
  analysis: AnalysisResult,
  checklist: ChecklistItem[],
  documentFlags: string[],
  hasDocumentCheck: boolean
): HybridScore {
  const checklistScore =
    checklist.length > 0
      ? Math.round(
          (checklist.filter((c) => c.passed).length / checklist.length) * 100
        )
      : 100;

  const structureScore = Math.max(0, 100 - documentFlags.length * 30);

  const raw: ScoreComponent[] = [
    {
      label: "AI semantic match",
      score: analysis.matchScore,
      weight: BASE_WEIGHTS.ai,
      detail: "How well the resume's content fits the role, judged by the AI.",
    },
    {
      label: "Recruiter checklist",
      score: checklistScore,
      weight: BASE_WEIGHTS.checklist,
      detail: `${checklist.filter((c) => c.passed).length}/${checklist.length} deterministic checks passed.`,
    },
  ];

  if (hasDocumentCheck) {
    raw.push({
      label: "Document structure",
      score: structureScore,
      weight: BASE_WEIGHTS.structure,
      detail:
        documentFlags.length === 0
          ? "No layout issues detected in the PDF."
          : `${documentFlags.length} structural issue(s) detected in the PDF.`,
    });
  }

  // No PDF was analyzed (pasted text) redistribute the structure weight
  // proportionally across the remaining components so weights still sum to 1.
  const totalWeight = raw.reduce((sum, c) => sum + c.weight, 0);
  const components = raw.map((c) => ({ ...c, weight: c.weight / totalWeight }));

  const finalScore = Math.round(
    components.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  return { finalScore, components };
}
