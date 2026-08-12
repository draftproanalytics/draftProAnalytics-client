import { apiService } from './api'
import type {
  ApiResponse,
  CombineScore,
  CombineScoreWorkspaceFilters,
  CombineScoreWorkspaceItem,
  CombineScoreWorkspacePagination,
  PaginationMeta,
} from '@/types'

export interface CombineScoreListResponse {
  data: CombineScore[]
  pagination?: PaginationMeta
}

export interface CombineScoreWorkspaceResponse {
  data: CombineScoreWorkspaceItem[]
  pagination: CombineScoreWorkspacePagination
}

export class CombineScoreService {
  private readonly endpoint = '/combine-scores'

  async getAll(): Promise<CombineScoreListResponse> {
    const response = await apiService.get<ApiResponse<CombineScore[], PaginationMeta>>(this.endpoint)
    return { data: response.data.data, pagination: response.data.pagination }
  }

  async getWorkspace(request: CombineScoreWorkspaceFilters = {}): Promise<CombineScoreWorkspaceResponse> {
    const params = Object.fromEntries(
      Object.entries(request).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    )
    const response = await apiService.get<ApiResponse<CombineScoreWorkspaceItem[], CombineScoreWorkspacePagination>>(
      `${this.endpoint}/workspace`,
      params,
    )
    return {
      data: response.data.data,
      pagination: response.data.pagination as CombineScoreWorkspacePagination,
    }
  }

  async getById(id: number): Promise<CombineScore> {
    const response = await apiService.get<ApiResponse<CombineScore>>(`${this.endpoint}/${id}`)
    return response.data.data
  }

  async getByPlayer(playerId: number): Promise<CombineScore> {
    const response = await apiService.get<ApiResponse<CombineScore>>(`${this.endpoint}/player/${playerId}`)
    return response.data.data
  }

  async getByProspect(prospectId: number): Promise<CombineScore> {
    const response = await apiService.get<ApiResponse<CombineScore>>(`${this.endpoint}/prospect/${prospectId}`)
    return response.data.data
  }

  async create(score: Omit<CombineScore, 'id'>): Promise<CombineScore> {
    const response = await apiService.post<ApiResponse<CombineScore>>(this.endpoint, score)
    return response.data.data
  }

  async update(id: number, score: Partial<CombineScore>): Promise<CombineScore> {
    const response = await apiService.put<ApiResponse<CombineScore>>(`${this.endpoint}/${id}`, score)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }
}

export const combineScoreService = new CombineScoreService()
