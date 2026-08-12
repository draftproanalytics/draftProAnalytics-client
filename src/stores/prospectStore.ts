import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { prospectService, type ProspectListRequest, type ProspectPagination } from '@/services/prospectService'
import type { CrudMode, Prospect, ProspectProfile } from '@/types'

export const useProspectStore = defineStore('prospect', () => {
  const prospects = ref<Prospect[]>([])
  const currentProspect = ref<Prospect | null>(null)
  const currentProfile = ref<ProspectProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const mode = ref<CrudMode>('read')
  const pagination = ref<ProspectPagination>({ page: 1, limit: 25, total: 0, pages: 0 })
  const lastRequest = ref<ProspectListRequest>({ page: 1, pageSize: 25 })

  const getProspectById = computed(() => (id: number) => prospects.value.find((item) => item.id === id))
  const getProspectsByPosition = computed(() => (position: string) => prospects.value.filter((item) => item.position === position))
  const getProspectsByCollege = computed(() => (college: string) => prospects.value.filter((item) => item.college === college))
  const getUndraftedProspects = computed(() => prospects.value.filter((item) => (item.draftStatus ?? (item.drafted ? 'DRAFTED' : 'PRE_DRAFT')) === 'PRE_DRAFT'))
  const getDraftedProspects = computed(() => prospects.value.filter((item) => (item.draftStatus ?? (item.drafted ? 'DRAFTED' : 'PRE_DRAFT')) === 'DRAFTED'))

  const fetchAll = async (request: ProspectListRequest = lastRequest.value) => {
    loading.value = true
    error.value = null
    try {
      lastRequest.value = { ...request }
      const response = await prospectService.getAll(request)
      prospects.value = response.data
      pagination.value = response.pagination
      return response
    } catch (err) {
      error.value = 'Failed to fetch prospects from server'
      console.error(err)
      throw err
    } finally { loading.value = false }
  }

  const fetchById = async (id: number, useCache = false) => {
    if (useCache) {
      const cached = getProspectById.value(id)
      if (cached) { currentProspect.value = cached; return cached }
    }
    loading.value = true; error.value = null
    try {
      currentProspect.value = await prospectService.getById(id)
      return currentProspect.value
    } catch (err) { error.value = 'Failed to fetch prospect from server'; throw err }
    finally { loading.value = false }
  }

  const fetchProfile = async (id: number) => {
    loading.value = true; error.value = null
    try {
      currentProfile.value = await prospectService.getProfile(id)
      currentProspect.value = currentProfile.value.prospect
      return currentProfile.value
    } catch (err) { error.value = 'Failed to fetch prospect profile from server'; throw err }
    finally { loading.value = false }
  }

  const fetchByPosition = (position: string) => prospectService.getAll({ position, page: 1, pageSize: 100 }).then((r) => r.data)
  const fetchByCollege = (college: string) => prospectService.getAll({ college, page: 1, pageSize: 100 }).then((r) => r.data)
  const fetchUndrafted = () => prospectService.getAll({ page: 1, pageSize: 100 }).then((r) => r.data.filter((p) => (p.draftStatus ?? (p.drafted ? 'DRAFTED' : 'PRE_DRAFT')) === 'PRE_DRAFT'))

  const create = async (data: Omit<Prospect, 'id'>) => {
    const created = await prospectService.create(data); currentProspect.value = created; return created
  }
  const update = async (id: number, data: Partial<Prospect>) => {
    const updated = await prospectService.update(id, data); currentProspect.value = updated; currentProfile.value = null; return updated
  }
  const remove = async (id: number) => {
    await prospectService.delete(id)
    await fetchAll(lastRequest.value)
    if (currentProspect.value?.id === id) currentProspect.value = null
  }

  const setMode = (newMode: CrudMode) => { mode.value = newMode }
  const clearCurrent = () => { currentProspect.value = null; currentProfile.value = null }
  const clearError = () => { error.value = null }
  const refreshData = () => fetchAll(lastRequest.value)

  return { prospects, currentProspect, currentProfile, loading, error, mode, pagination, lastRequest,
    getProspectById, getProspectsByPosition, getProspectsByCollege, getUndraftedProspects, getDraftedProspects,
    fetchAll, fetchById, fetchProfile, fetchByPosition, fetchByCollege, fetchUndrafted, create, update, remove, setMode, clearCurrent, clearError, refreshData }
})
