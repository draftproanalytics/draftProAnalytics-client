import axios, { type AxiosInstance } from 'axios'
import type { TeamNeedDto, TeamNeedSource, TeamNeedStatus, TeamNeedsPageDto, RosterPlayerOptionDto, PlayerSeasonEvaluationDto, TeamPositionContextCatalogDto, TeamPositionContextDto, TeamPositionAssessmentDto } from '../domain/dtos/TeamNeedDtos'

export interface UpsertTeamNeedRequest {
  position: string;
  priority: number;
  draftYear: number;
  needScore?: number | null;
  source?: TeamNeedSource;
  status?: TeamNeedStatus;
}

export class TeamNeedsApi {
  public constructor(private readonly http: AxiosInstance) {}

  public async getNeedsPage(teamId: number, draftYear: number, evaluationYear?: number): Promise<TeamNeedsPageDto> {
    const params: Record<string, string> = { draftYear: String(draftYear) }
    if (typeof evaluationYear === 'number') params.evaluationYear = String(evaluationYear)
    const response = await this.http.get<TeamNeedsPageDto>(`/api/teams/${teamId}/needs-page`, { params })
    return response.data
  }

  public async upsertTeamNeed(teamId: number, request: UpsertTeamNeedRequest): Promise<TeamNeedDto> {
    const response = await this.http.put<TeamNeedDto>(`/api/teams/${teamId}/team-needs`, request)
    return response.data
  }

  public async reviewTeamNeed(id: number, status: 'APPROVED' | 'REJECTED', reviewedByPersonId?: number): Promise<TeamNeedDto> {
    const action = status === 'APPROVED' ? 'approve' : 'reject'
    const response = await this.http.patch<TeamNeedDto>(`/api/team-needs/${id}/${action}`, { reviewedByPersonId })
    return response.data
  }

  public async getRosterPlayers(teamId: number): Promise<RosterPlayerOptionDto[]> {
    return (await this.http.get<RosterPlayerOptionDto[]>(`/api/teams/${teamId}/roster-players`)).data
  }

  public async getPlayerEvaluations(teamId: number, seasonYear: number): Promise<PlayerSeasonEvaluationDto[]> {
    return (await this.http.get<PlayerSeasonEvaluationDto[]>(`/api/teams/${teamId}/player-evaluations`, { params: { seasonYear } })).data
  }

  public async savePlayerEvaluation(request: PlayerSeasonEvaluationDto): Promise<PlayerSeasonEvaluationDto> {
    return (await this.http.put<PlayerSeasonEvaluationDto>('/api/player-evaluations', request)).data
  }

  public async deletePlayerEvaluation(id: string): Promise<void> {
    await this.http.delete(`/api/player-evaluations/${id}`)
  }

  public async getContextCatalog(): Promise<TeamPositionContextCatalogDto[]> {
    return (await this.http.get<TeamPositionContextCatalogDto[]>('/api/team-needs/context-catalog')).data
  }

  public async getPositionContexts(teamId: number, draftYear: number): Promise<TeamPositionContextDto[]> {
    return (await this.http.get<TeamPositionContextDto[]>(`/api/teams/${teamId}/position-contexts`, { params: { draftYear } })).data
  }

  public async savePositionContext(request: TeamPositionContextDto): Promise<TeamPositionContextDto> {
    return (await this.http.put<TeamPositionContextDto>('/api/team-position-contexts', request)).data
  }

  public async deletePositionContext(id: string): Promise<void> {
    await this.http.delete(`/api/team-position-contexts/${id}`)
  }

  public async getPositionAssessments(teamId: number, draftYear: number): Promise<TeamPositionAssessmentDto[]> {
    return (await this.http.get<TeamPositionAssessmentDto[]>(`/api/teams/${teamId}/position-assessments`, { params: { draftYear } })).data
  }

  public async savePositionAssessment(request: TeamPositionAssessmentDto): Promise<TeamPositionAssessmentDto> {
    return (await this.http.put<TeamPositionAssessmentDto>('/api/team-position-assessments', request)).data
  }

  public async deletePositionAssessment(id: string): Promise<void> {
    await this.http.delete(`/api/team-position-assessments/${id}`)
  }

  public async deleteTeamNeed(teamId: number, draftYear: number, position: string): Promise<void> {
    await this.http.delete(`/api/teams/${teamId}/team-needs/${encodeURIComponent(position)}`, {
      params: { draftYear: String(draftYear) }
    })
  }
}

export function buildTeamNeedsApi(): TeamNeedsApi {
  return new TeamNeedsApi(axios)
}
