import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  CombineScore,
  CombineScoreWorkspaceFilters,
  CombineScoreWorkspaceItem,
  CombineScoreWorkspacePagination,
  CrudMode,
} from '@/types'
import { combineScoreService } from '@/services/combineScoreService'

export const useCombineScoreStore = defineStore('combineScore', () => {
  const scores = ref<CombineScore[]>([])
  const workspaceRows = ref<CombineScoreWorkspaceItem[]>([])
  const currentScore = ref<CombineScore | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')
  const workspacePagination = ref<CombineScoreWorkspacePagination>({ page: 1, limit: 25, total: 0, pages: 0 })
  const lastWorkspaceRequest = ref<CombineScoreWorkspaceFilters>({ page: 1, pageSize: 25, sortField: 'name', sortOrder: 'asc' })

  const getScoreById = computed(() => (id: number) => scores.value.find((score) => score.id === id))
  const combineScores = computed(() => scores.value)
  const currentCombineScore = computed(() => currentScore.value)
  const getScoreByPlayer = computed(() => (playerId: number) => scores.value.find((score) => score.playerId === playerId))

  const getTopPerformers = computed(() => {
    return (metric: keyof CombineScore, limit = 10) => [...scores.value]
      .sort((a, b) => {
        const aVal = a[metric] as number
        const bVal = b[metric] as number
        if (metric.includes('Time') || metric.includes('Split')) return aVal - bVal
        return bVal - aVal
      })
      .slice(0, limit)
  })

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await combineScoreService.getAll()
      scores.value = response.data
      return response
    } catch (err) {
      error.value = 'Failed to fetch combine scores'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchWorkspace = async (request: CombineScoreWorkspaceFilters = lastWorkspaceRequest.value) => {
    loading.value = true
    error.value = null
    try {
      lastWorkspaceRequest.value = { ...request }
      const response = await combineScoreService.getWorkspace(request)
      workspaceRows.value = response.data
      workspacePagination.value = response.pagination
      return response
    } catch (err) {
      error.value = 'Failed to load the Combine Scores workspace'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshWorkspace = () => fetchWorkspace(lastWorkspaceRequest.value)

  const fetchById = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      currentScore.value = await combineScoreService.getById(id)
      return currentScore.value
    } catch (err) {
      error.value = 'Failed to fetch combine score'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchByPlayer = async (playerId: number) => {
    loading.value = true
    error.value = null
    try {
      currentScore.value = await combineScoreService.getByPlayer(playerId)
      return currentScore.value
    } catch (err) {
      error.value = 'Failed to fetch combine score for player'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchByProspect = async (prospectId: number) => {
    loading.value = true
    error.value = null
    try {
      currentScore.value = await combineScoreService.getByProspect(prospectId)
      return currentScore.value
    } catch (err) {
      error.value = 'Failed to fetch combine score for prospect'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (score: Omit<CombineScore, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      const created = await combineScoreService.create(score)
      scores.value.push(created)
      currentScore.value = created
      return created
    } catch (err) {
      error.value = 'Failed to create combine score'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, score: Partial<CombineScore>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await combineScoreService.update(id, score)
      const index = scores.value.findIndex((item) => item.id === id)
      if (index !== -1) scores.value[index] = updated
      currentScore.value = updated
      return updated
    } catch (err) {
      error.value = 'Failed to update combine score'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await combineScoreService.delete(id)
      scores.value = scores.value.filter((score) => score.id !== id)
      if (currentScore.value?.id === id) currentScore.value = null
      await refreshWorkspace()
    } catch (err) {
      error.value = 'Failed to delete combine score'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setMode = (newMode: CrudMode) => { mode.value = newMode }
  const clearCurrent = () => { currentScore.value = null }
  const clearError = () => { error.value = null }

  return {
    scores,
    workspaceRows,
    currentScore,
    combineScores,
    currentCombineScore,
    workspacePagination,
    lastWorkspaceRequest,
    loading,
    error,
    mode,
    getScoreById,
    getScoreByPlayer,
    getTopPerformers,
    fetchAll,
    fetchWorkspace,
    refreshWorkspace,
    fetchById,
    fetchByPlayer,
    fetchByProspect,
    create,
    update,
    remove,
    setMode,
    clearCurrent,
    clearError,
  }
})
