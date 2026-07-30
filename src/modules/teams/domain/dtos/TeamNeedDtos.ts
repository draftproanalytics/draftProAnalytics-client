export type TeamNeedSource = 'MANUAL' | 'GENERATED' | 'IMPORTED'
export type TeamNeedStatus = 'RECOMMENDED' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN'

export interface TeamNeedDto {
  id: number;
  teamId: number;
  position: string;
  priority: number;
  draftYear: number;
  needScore: number | null;
  source: TeamNeedSource;
  status: TeamNeedStatus;
  asOfDate: string | null;
  algorithmVersion: string | null;
  rationaleJson: unknown;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TeamNeedSuggestionDto {
  position: string;
  priority: number;
  draftYear: number;
  reasons: string[];
  rosterCount: number;
  avgAge: number | null;
  expiringCount: number;
}

export interface TeamNeedsPageDto {
  teamId: number;
  evaluationYear: number;
  draftYear: number;
  persistedNeeds: TeamNeedDto[];
  suggestions: TeamNeedSuggestionDto[];
}

export interface RosterPlayerOptionDto {
  id: string;
  playerName: string;
  position: string;
  positionGroup: string;
}

export interface PlayerSeasonEvaluationDto {
  id?: string;
  rosterPlayerId: string;
  teamId: number;
  seasonYear: number;
  position: string;
  sourceType: string;
  sourceName: string;
  sourceReference?: string | null;
  overallGrade?: number | null;
  positionRank?: number | null;
  qualifyingPlayerCount?: number | null;
  passBlockGrade?: number | null;
  runBlockGrade?: number | null;
  receivingGrade?: number | null;
  coverageGrade?: number | null;
  passRushGrade?: number | null;
  metricsJson?: Record<string, unknown> | null;
  analystContextJson?: Record<string, unknown> | null;
  verified: boolean;
  effectiveAsOfDate: string;
}

export interface TeamPositionContextCatalogDto {
  id: number;
  contextCode: string;
  displayName: string;
  description?: string | null;
  positionScope?: string | null;
  defaultWeight: number;
  maximumWeight: number;
}

export interface TeamPositionContextDto {
  id?: string;
  teamId: number;
  draftYear: number;
  position: string;
  contextCatalogId?: number | null;
  contextType?: string;
  riskLevel: string;
  contextScore?: number;
  appliedWeight?: number | null;
  analystConfidence?: number | null;
  summary: string;
  evidenceJson?: Record<string, unknown> | null;
  source: string;
  status: string;
  TeamPositionContextCatalog?: TeamPositionContextCatalogDto | null;
}

export interface TeamPositionAssessmentDto {
  id?: string;
  teamId: number;
  draftYear: number;
  seasonYear: number;
  position: string;
  assessmentType: string;
  algorithmVersion?: string | null;
  rosterCountScore?: number | null;
  topStarterScore?: number | null;
  secondStarterScore?: number | null;
  depthQualityScore?: number | null;
  productionScore?: number | null;
  assignmentGradeScore?: number | null;
  roleCompletenessScore?: number | null;
  contextRiskScore?: number | null;
  dataConfidence: number;
  calculatedNeedScore?: number | null;
  analystOverrideScore?: number | null;
  finalNeedScore?: number | null;
  priority?: number | null;
  reason?: string | null;
  status: string;
}
