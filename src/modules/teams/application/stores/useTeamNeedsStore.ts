import { defineStore } from 'pinia'
import type { TeamNeedDto, TeamNeedsPageDto, TeamNeedSuggestionDto } from '../../domain/dtos/TeamNeedDtos'
import { buildTeamNeedsApi } from '../../infrastructure/TeamNeedsApi'
import { LoadTeamNeedsPageUseCase } from '../usecases/LoadTeamNeedsPageUseCase'
import { UpsertTeamNeedUseCase } from '../usecases/UpsertTeamNeedUseCase'
import { DeleteTeamNeedUseCase } from '../usecases/DeleteTeamNeedUseCase'

export interface TeamNeedsState {
  isLoading: boolean;
  error: string | null;
  teamId: number | null;
  evaluationYear: number | null;
  draftYear: number | null;
  persistedNeeds: TeamNeedDto[];
  suggestions: TeamNeedSuggestionDto[];
}

export const useTeamNeedsStore = defineStore('teamNeeds', {
  state: (): TeamNeedsState => ({
    isLoading: false, error: null, teamId: null, evaluationYear: null, draftYear: null,
    persistedNeeds: [], suggestions: []
  }),
  actions: {
    async load(teamId: number, draftYear: number): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        const page: TeamNeedsPageDto = await new LoadTeamNeedsPageUseCase(buildTeamNeedsApi()).execute(teamId, draftYear)
        this.teamId = page.teamId
        this.evaluationYear = page.evaluationYear
        this.draftYear = page.draftYear
        this.persistedNeeds = page.persistedNeeds
        this.suggestions = page.suggestions
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Failed to load team needs.'
      } finally {
        this.isLoading = false
      }
    },

    async applySuggestion(teamId: number, suggestion: TeamNeedSuggestionDto): Promise<void> {
      const saved = await new UpsertTeamNeedUseCase(buildTeamNeedsApi()).execute(teamId, {
        position: suggestion.position, priority: suggestion.priority, draftYear: suggestion.draftYear,
        source: 'GENERATED', status: 'APPROVED'
      })
      this.replaceSavedNeed(saved)
    },

    async saveNeed(teamId: number, need: { position: string; priority: number; draftYear: number }): Promise<void> {
      const saved = await new UpsertTeamNeedUseCase(buildTeamNeedsApi()).execute(teamId, {
        ...need, source: 'MANUAL', status: 'OVERRIDDEN'
      })
      this.replaceSavedNeed(saved)
    },


    async reviewNeed(id: number, status: 'APPROVED' | 'REJECTED'): Promise<void> {
      const saved = await buildTeamNeedsApi().reviewTeamNeed(id, status)
      this.replaceSavedNeed(saved)
    },

    async deleteNeed(teamId: number, draftYear: number, position: string): Promise<void> {
      await new DeleteTeamNeedUseCase(buildTeamNeedsApi()).execute(teamId, draftYear, position)
      this.persistedNeeds = this.persistedNeeds.filter((need) => !(need.position === position && need.draftYear === draftYear))
    },

    replaceSavedNeed(saved: TeamNeedDto): void {
      const index = this.persistedNeeds.findIndex((need) =>
        need.position === saved.position && need.draftYear === saved.draftYear
      )
      if (index >= 0) this.persistedNeeds.splice(index, 1, saved)
      else this.persistedNeeds.push(saved)
      this.persistedNeeds.sort((a, b) => a.priority - b.priority || a.position.localeCompare(b.position))
    }
  }
})
