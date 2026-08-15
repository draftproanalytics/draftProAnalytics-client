import { apiService } from './api'
import type { ApiResponse, Player } from '@/types'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}


export type PlayerSortField = 'firstName' | 'lastName' | 'position' | 'university'

export interface PlayerListQuery {
  page?: number
  limit?: number
  search?: string
  sortField?: PlayerSortField
  sortOrder?: 1 | -1
}

export interface TeamStatistics {
  overallRecord: { wins: number; losses: number; ties: number }
  conferenceRecord: { wins: number; losses: number; ties: number }
  divisionRecord: { wins: number; losses: number; ties: number }
  divisionPosition: number
  divisionTotal: number
}

export class PlayerService {
  private readonly endpoint = '/players'

  async getAll(query: PlayerListQuery = {}): Promise<{ data: Player[]; pagination: PaginationMeta }> {
    const response = await apiService.get<ApiResponse<Player[]>>(this.endpoint, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      search: query.search?.trim() || undefined,
      sortField: query.sortField,
      sortOrder: query.sortOrder,
    })
    return {
      data: response.data.data,
      pagination: response.data.pagination as PaginationMeta,
    }
  }

  async getById(id: number): Promise<Player> {
    const response = await apiService.get<ApiResponse<Player>>(`${this.endpoint}/${id}`)
    return response.data.data
  }

  async getByName(name: string): Promise<Player[]> {
    const response = await apiService.get<ApiResponse<Player[]>>(`${this.endpoint}/filter`, { name })
    return response.data.data
  }

  async create(player: Omit<Player, 'id'>): Promise<Player> {
    const response = await apiService.post<ApiResponse<Player>>(this.endpoint, player)
    return response.data.data
  }

  async update(id: number, player: Partial<Player>): Promise<Player> {
    const response = await apiService.put<ApiResponse<Player>>(`${this.endpoint}/${id}`, player)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }

  async getTeamStatistics(teamId: number, seasonYear: string): Promise<TeamStatistics> {
    const response = await apiService.get<ApiResponse<TeamStatistics>>(
      `${this.endpoint}/team/${teamId}/statistics`,
      { seasonYear },
    )
    return response.data.data
  }
}

export const playerService = new PlayerService()
