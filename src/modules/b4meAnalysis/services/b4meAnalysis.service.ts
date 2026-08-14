import { api } from '@/services/api';
import type {
  B4MeEvaluationResponse,
  B4MeScoringMode,
  ManualWrObservedMetricsRequest
} from '../types/b4meAnalysis';

export type B4MeSearchRequest = {
  playerName: string | null;
  draftYear: number | null;
  scoringMode: B4MeScoringMode;
  includeMethodology: boolean;
  includeTeamContextPlaceholder: boolean;
  enableCompetitionDiscount: boolean;
  enableInjuryAvailabilityAdjustment: boolean;
  enableQbOffenseContextAdjustment: boolean;
  enableSampleSizeAdjustment: boolean;
  enableArchetypeConfidenceAdjustment: boolean;
  enableCoachabilityAdjustment: boolean;
  enableRfaAdjustment: boolean;
  enableRvaAdjustment: boolean;
};

export async function searchB4MeProspects(
  request: B4MeSearchRequest
): Promise<B4MeEvaluationResponse> {
  const response = await api.get<B4MeEvaluationResponse>('/b4me/prospects', {
    params: request
  });

  return response.data;
}
export async function saveManualWrObservedMetrics(
  prospectId: number,
  request: ManualWrObservedMetricsRequest
): Promise<void> {
  await api.put(`/b4me/prospects/${prospectId}/manual-observed-metrics`, request);
}


export interface B4MeWrEvaluationJobRequest {
  readonly draftYear: number;
  readonly positionGroup: 'WR';
  readonly refreshPolicy: 'MISSING_ONLY' | 'MISSING_OR_STALE' | 'FORCE_REFRESH';
  readonly scoringMode: B4MeScoringMode;
}

export interface B4MeWrEvaluationJob {
  readonly id: number;
  readonly type: string;
  readonly status: string;
  readonly progressPercent: number;
  readonly totalItems: number;
  readonly processedItems: number;
  readonly resultCode: string | null;
  readonly resultJson: Record<string, unknown> | null;
  readonly errorMessage: string | null;
}

export async function enqueueB4MeWrEvaluation(request: B4MeWrEvaluationJobRequest): Promise<B4MeWrEvaluationJob> {
  const response = await api.post<B4MeWrEvaluationJob>('/jobs/b4me-wr-evaluation', request);
  return response.data;
}

export async function readB4MeWrEvaluationJob(jobId: number): Promise<B4MeWrEvaluationJob> {
  const response = await api.get<B4MeWrEvaluationJob>(`/jobs/${jobId}`);
  return response.data;
}
