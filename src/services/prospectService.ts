import { apiService } from './api'
import type { ApiResponse, Prospect, ProspectListFilters, ProspectProfile } from '@/types'

export interface ProspectPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ProspectListRequest extends ProspectListFilters {
  page?: number
  pageSize?: number
}

export class ProspectService {
  private readonly endpoint = '/prospects'

  async getAll(request: ProspectListRequest = {}): Promise<{ data: Prospect[]; pagination: ProspectPagination }> {
    const params = Object.fromEntries(
      Object.entries(request).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )
    const response = await apiService.get<ApiResponse<Prospect[], ProspectPagination>>(this.endpoint, params)
    return { data: response.data.data, pagination: response.data.pagination as ProspectPagination }
  }

  async getById(id: number): Promise<Prospect> {
    const response = await apiService.get<ApiResponse<Prospect>>(`${this.endpoint}/${id}`)
    return response.data.data
  }

  async getProfile(id: number): Promise<ProspectProfile> {
    const response = await apiService.get<ApiResponse<ProspectProfile>>(`${this.endpoint}/${id}/profile`)
    return response.data.data
  }

  async create(data: Omit<Prospect, 'id'>): Promise<Prospect> {
    const response = await apiService.post<ApiResponse<Prospect>>(this.endpoint, data)
    return response.data.data
  }

  async update(id: number, data: Partial<Prospect>): Promise<Prospect> {
    const response = await apiService.put<ApiResponse<Prospect>>(`${this.endpoint}/${id}`, data)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }
}

export const prospectService = new ProspectService()
