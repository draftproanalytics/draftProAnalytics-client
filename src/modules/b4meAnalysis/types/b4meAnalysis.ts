export type B4MePositionGroup = 'WR' | 'ED' | 'OT' | 'DT' | 'CB';
export type B4MeScoringMode = 'BASE_ONLY' | 'BASE_PLUS_CONTEXT' | 'FULL_DECISION_SCORE';
export type B4MeValidationStatus = 'UNVALIDATED' | 'PARTIALLY_VALIDATED' | 'VALIDATED' | 'DEPRECATED';

export interface B4MeMethodologySection {
  key: string;
  title: string;
  body: string;
}

export interface B4MeMethodologyMetadata {
  frameworkVersion: string;
  positionGroupFrameworkType: string;
  methodologyLineage: string;
  validationStatus: B4MeValidationStatus;
  validationNote: string | null;
  knownLimitations: string[];
  scoringModeUsed: B4MeScoringMode;
  methodologySections: B4MeMethodologySection[];
}

export interface B4MeActiveFilterSummary {
  limitationFiltersEnabled: boolean;
  decisionViewEnabled: boolean;
  scoringMode: B4MeScoringMode;
  playerName: string | null;
  draftYear: number | null;
  positionGroup: B4MePositionGroup;
  badges: string[];
}

export interface B4MeOptionalTeamContext {
  teamCoachingGradeByGroup: string | null;
  teamDevelopmentEnvironment: string | null;
  teamUsageFitContext: string | null;
  isDeferred: boolean;
  isApplied: boolean;
  label: string;
}

export interface B4MeScoreExplanation {
  title: string;
  summary: string;
  lines: string[];
}

export interface B4MeDecisionViewDimensions {
  coachability: number;
  rfa: number;
  rva: number;
}



export interface B4MeMetricDisplayItem {
  key: string;
  label: string;
  value: number | string | null;
  unit: string | null;
}

export interface B4MeObservedMetrics {
  sourceProvider: string | null;
  sourcesUsed: string[];
  metricSeasonYear: number | null;
  seasonSelectionPolicy: string | null;
  items: B4MeMetricDisplayItem[];
  manualObservation: {
    sourceName: string;
    sourceUrl: string | null;
    notes: string | null;
    enteredByPersonId: number;
    enteredAt: string;
    fields: string[];
  } | null;
}

export interface B4MeDerivedMetrics {
  items: B4MeMetricDisplayItem[];
  note: string;
}

export interface B4MeEvaluativeJudgment {
  coachability: {
    tier: string | null;
    adjustment: number;
    pressManSurvivability: string | null;
    summary: string | null;
  };
  rfa: {
    tier: string | null;
    adjustment: number;
    summary: string | null;
  };
  rva: {
    tier: string | null;
    score: number | null;
  };
  finalB4MeAssessment: {
    score: number;
    label: string;
    explanation: string;
    projectionNote: string | null;
  };
}
export type B4MeResearchIndicatorStatus =
  | 'HIT'
  | 'MISS'
  | 'DERIVED_ESTIMATE'
  | 'UNVERIFIED'
  | 'UNAVAILABLE';

export interface B4MeResearchIndicatorItem {
  key: string;
  label: string;
  value: number | null;
  threshold: number;
  comparison: string;
  status: B4MeResearchIndicatorStatus | string;
}

export interface B4MeResearchIndicators {
  methodologyVersion: string;
  sourceProvider: string | null;
  sourcesUsed: string[];
  thresholdsMet: number;
  sourceBackedMetricCount: number;
  derivedMetricCount: number;
  metricSeasonYear: number | null;
  seasonSelectionPolicy: string | null;
  items: B4MeResearchIndicatorItem[];
}

export interface B4MeEvaluationRow {
  prospectId: number;
  playerName: string;
  school: string | null;
  positionGroup: B4MePositionGroup;
  draftYear: number | null;
  baseScore: number;
  enhancedScore: number;
  decisionViewScore: number;
  scoreLabel: string;
  scoreExplanation: string;
  evaluationNotes: string | null;
  decisionViewDimensions: B4MeDecisionViewDimensions;
  observedMetrics: B4MeObservedMetrics;
  researchIndicators: B4MeResearchIndicators;
  derivedMetrics: B4MeDerivedMetrics;
  evaluativeJudgment: B4MeEvaluativeJudgment;
}

export interface B4MeEvaluationResponse {
  rows: B4MeEvaluationRow[];
  methodology: B4MeMethodologyMetadata | null;
  activeFilterSummary: B4MeActiveFilterSummary;
  optionalTeamContext: B4MeOptionalTeamContext | null;
}

export interface ManualWrObservedMetricsRequest {
  yprr: number;
  pffOverallGrade: number;
  contestedCatchRate: number;
  behindLosTargetRate: number;
  metricSeasonYear: number;
  sourceName: string;
  sourceUrl: string | null;
  notes: string | null;
}
