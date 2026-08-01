// src/modules/jobs/application/DpaJobsApi.ts
import axios, { type AxiosInstance } from 'axios';
import type {
  DpaJobListQuery,
  DpaJobLogEntry,
  DpaJobSummary,
  ImportNflGameScoresCommand,
  LoadNflSeasonScheduleCommand,
  LoadEspnDraftClassPlayersCommand,
  LoadEspnDraftResultsCommand,
  EnrichPlayerTeamPositionsCommand,
  SyncEspnDraftPicksToDpaCommand,
  LoadEspnTeamRostersCommand,
  SyncPostSeasonResultsCommand,
  GenerateTeamNeedsCommand,
  ProcessJobQueueCommand,
  ProcessJobQueueResult,
  ImportNflversePlayerProductionCommand,
  NflverseProductionReviewRow,
  RosterMatchCandidate,
} from '../domain/NflJobTypes';

const resolveApiBaseUrl = (): string => {
  const viteBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof viteBaseUrl === 'string' && viteBaseUrl.trim() !== '') {
    return viteBaseUrl.trim();
  }

  return '/api';
};

const httpClient: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export class DpaJobsApi {
  public async enqueueLoadNflSeasonSchedule(command: LoadNflSeasonScheduleCommand): Promise<DpaJobSummary> {
    const response = await httpClient.post<DpaJobSummary>('/jobs/imports/nfl-season-schedule', command);
    return response.data;
  }

  public async enqueueImportNflGameScores(command: ImportNflGameScoresCommand): Promise<DpaJobSummary> {
    const response = await httpClient.post<DpaJobSummary>('/jobs/imports/nfl-game-scores', command);
    return response.data;
  }

  public async enqueueLoadEspnDraftClassPlayers(command: LoadEspnDraftClassPlayersCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-draft-class-players', command); return response.data; }
  public async enqueueLoadEspnDraftResults(command: LoadEspnDraftResultsCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-draft-results', command); return response.data; }
  public async enqueueSyncEspnDraftPicksToDpa(command: SyncEspnDraftPicksToDpaCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-draft-picks/sync', command); return response.data; }
  public async enqueueEnrichPlayerTeamPositions(command: EnrichPlayerTeamPositionsCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/player-team-positions', command); return response.data; }
  public async enqueueLoadEspnTeamRosters(command: LoadEspnTeamRostersCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-team-rosters', command); return response.data; }
  public async enqueueGenerateTeamNeeds(command: GenerateTeamNeedsCommand): Promise<DpaJobSummary> {
    const response = await httpClient.post<DpaJobSummary>('/jobs/team-needs/generate', command);
    return response.data;
  }

  public async enqueueSyncPostSeasonResults(command: SyncPostSeasonResultsCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/postseason-results/sync', command); return response.data; }

  public async enqueueImportNflversePlayerProduction(command: ImportNflversePlayerProductionCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/nflverse-player-production', command); return response.data; }
  public async listNflverseProductionReview(seasonYear: number, status?: string): Promise<readonly NflverseProductionReviewRow[]> { const response = await httpClient.get<readonly NflverseProductionReviewRow[]>('/jobs/player-production/review', { params: { seasonYear, status } }); return response.data; }
  public async listNflverseMatchCandidates(id: string): Promise<readonly RosterMatchCandidate[]> { const response = await httpClient.get<readonly RosterMatchCandidate[]>(`/jobs/player-production/review/${id}/candidates`); return response.data; }
  public async updateNflverseMatch(id: string, matchedRosterPlayerId: string | null, matchStatus: string, reviewNotes?: string): Promise<void> { await httpClient.patch(`/jobs/player-production/review/${id}`, { matchedRosterPlayerId, matchStatus, reviewNotes }); }
  public async promoteNflverseProduction(seasonYear: number): Promise<{ promoted: number; skipped: number }> { const response = await httpClient.post('/jobs/player-production/promote', { seasonYear }); return response.data; }
  public async recalculateNflverseAssessments(seasonYear: number, draftYear: number, teamId?: number): Promise<{ assessmentsUpdated: number }> { const response = await httpClient.post('/jobs/player-production/recalculate', { seasonYear, draftYear, teamId }); return response.data; }

  public async processJobQueue(command: ProcessJobQueueCommand): Promise<ProcessJobQueueResult> {
    const response = await httpClient.post<ProcessJobQueueResult>('/jobs/queue/process', command);
    return response.data;
  }

  public async listJobs(query: DpaJobListQuery): Promise<readonly DpaJobSummary[]> {
    const response = await httpClient.get<readonly DpaJobSummary[]>('/jobs', {
      params: {
        status: query.status,
        type: query.type,
        limit: query.limit ?? 50,
      },
    });

    return response.data;
  }

  public async readJob(jobId: number): Promise<DpaJobSummary> {
    const response = await httpClient.get<DpaJobSummary>(`/jobs/${jobId}`);
    return response.data;
  }

  public async readJobLogs(jobId: number): Promise<readonly DpaJobLogEntry[]> {
    const response = await httpClient.get<readonly DpaJobLogEntry[]>(`/jobs/${jobId}/logs`);
    return response.data;
  }

  public async cancelJob(jobId: number, reason: string): Promise<void> {
    await httpClient.post<void>(`/jobs/${jobId}/cancel`, { reason });
  }
}

export const dpaJobsApi = new DpaJobsApi();
