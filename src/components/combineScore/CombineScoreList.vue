<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useCombineScoreStore } from '@/stores/combineScoreStore'
import type { CombineMeasurementStatus, CombineScoreWorkspaceFilters, CombineScoreWorkspaceItem } from '@/types'
import {
  formatDistanceMeasurement,
  formatHeightMeasurement,
  formatScoutingInches,
  formatTimeMeasurement,
} from '@/utils/scoutingMeasurements'

interface PageEvent { page: number; rows: number }
interface SortEvent { sortField?: string; sortOrder?: number }

const store = useCombineScoreStore()
const router = useRouter()
const currentYear = new Date().getFullYear()

const filters = reactive<{
  draftYear: number | null
  position: string | null
  college: string
  playerName: string
  combineStatus: CombineMeasurementStatus | null
}>({
  draftYear: null,
  position: null,
  college: '',
  playerName: '',
  combineStatus: null,
})

const draftYearOptions = Array.from({ length: 20 }, (_, index) => currentYear + 5 - index)
const positionOptions = ['QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'C', 'OL', 'EDGE', 'DE', 'DT', 'DL', 'LB', 'CB', 'S', 'DB', 'K', 'P', 'LS']
const statusOptions: Array<{ label: string; value: CombineMeasurementStatus }> = [
  { label: 'Missing', value: 'MISSING' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Complete', value: 'COMPLETE' },
]

const first = computed(() => (store.workspacePagination.page - 1) * store.workspacePagination.limit)

const requestFromFilters = (overrides: Partial<CombineScoreWorkspaceFilters> = {}): CombineScoreWorkspaceFilters => ({
  draftYear: filters.draftYear ?? undefined,
  position: filters.position ?? undefined,
  college: filters.college.trim() || undefined,
  playerName: filters.playerName.trim() || undefined,
  combineStatus: filters.combineStatus ?? undefined,
  page: 1,
  pageSize: store.workspacePagination.limit || 25,
  sortField: store.lastWorkspaceRequest.sortField ?? 'name',
  sortOrder: store.lastWorkspaceRequest.sortOrder ?? 'asc',
  ...overrides,
})

const loadWorkspace = async (overrides: Partial<CombineScoreWorkspaceFilters> = {}) => {
  await store.fetchWorkspace(requestFromFilters(overrides))
}

onMounted(() => loadWorkspace())

const applyFilters = () => loadWorkspace({ page: 1 })

const clearFilters = () => {
  filters.draftYear = null
  filters.position = null
  filters.college = ''
  filters.playerName = ''
  filters.combineStatus = null
  return loadWorkspace({ page: 1, sortField: 'name', sortOrder: 'asc' })
}

const onPage = (event: PageEvent) => loadWorkspace({ page: event.page + 1, pageSize: event.rows })

const onSort = (event: SortEvent) => {
  if (!event.sortField) return
  return loadWorkspace({
    page: 1,
    sortField: event.sortField as CombineScoreWorkspaceFilters['sortField'],
    sortOrder: event.sortOrder === -1 ? 'desc' : 'asc',
  })
}

const viewProspect = (prospectId: number) => router.push(`/prospects/${prospectId}`)
const createCombineScore = (prospectId?: number) => router.push(prospectId ? `/combine-scores?mode=create&prospectId=${prospectId}` : '/combine-scores?mode=create')
const viewCombineScore = (id: number) => router.push(`/combine-scores/${id}?mode=read`)
const editCombineScore = (id: number) => router.push(`/combine-scores/${id}?mode=edit`)

const deleteCombineScore = async (id: number, fullName: string) => {
  if (confirm(`Delete combine measurements for ${fullName}?`)) await store.remove(id)
}

const statusSeverity = (status: CombineMeasurementStatus): 'success' | 'warning' | 'danger' =>
  status === 'COMPLETE' ? 'success' : status === 'PARTIAL' ? 'warning' : 'danger'

const score = (row: CombineScoreWorkspaceItem) => row.combineScore
const formatWeight = (value?: number) => value == null ? '—' : `${Number.isInteger(value) ? value : value.toFixed(1)}`
const formatReps = (value?: number) => value == null ? '—' : value.toString()
</script>

<template>
  <section class="combine-workspace">
    <div class="page-header">
      <div>
        <h1>Combine Scores</h1>
        <p>Compare and maintain athletic measurements across the prospect pool.</p>
      </div>
      <Button label="Add Combine Measurements" icon="pi pi-plus" @click="createCombineScore()" />
    </div>

    <div class="filters-panel">
      <div class="filter-field">
        <label for="combineDraftYear">Draft Year</label>
        <Dropdown id="combineDraftYear" v-model="filters.draftYear" :options="draftYearOptions" placeholder="All years" showClear />
      </div>
      <div class="filter-field">
        <label for="combinePosition">Position</label>
        <Dropdown id="combinePosition" v-model="filters.position" :options="positionOptions" placeholder="All positions" showClear />
      </div>
      <div class="filter-field college-filter">
        <label for="combineCollege">College</label>
        <InputText id="combineCollege" v-model="filters.college" placeholder="College" @keyup.enter="applyFilters" />
      </div>
      <div class="filter-field name-filter">
        <label for="combinePlayerName">Prospect Name</label>
        <InputText id="combinePlayerName" v-model="filters.playerName" placeholder="First or last name" @keyup.enter="applyFilters" />
      </div>
      <div class="filter-field">
        <label for="combineStatus">Combine Status</label>
        <Dropdown id="combineStatus" v-model="filters.combineStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="All statuses" showClear />
      </div>
      <div class="filter-actions">
        <Button label="Apply" icon="pi pi-filter" @click="applyFilters" />
        <Button label="Clear" icon="pi pi-filter-slash" severity="secondary" outlined @click="clearFilters" />
      </div>
    </div>

    <div v-if="store.error" class="error-message">{{ store.error }}</div>

    <DataTable
      :value="store.workspaceRows"
      :loading="store.loading"
      lazy
      paginator
      :first="first"
      :rows="store.workspacePagination.limit"
      :totalRecords="store.workspacePagination.total"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      scrollable
      scrollHeight="flex"
      responsiveLayout="scroll"
      sortMode="single"
      @page="onPage"
      @sort="onSort"
    >
      <template #empty>No prospects match the selected Combine filters.</template>

      <Column field="name" header="Prospect" sortable frozen style="min-width: 12rem">
        <template #body="{ data }">
          <button class="prospect-link" type="button" @click="viewProspect(data.prospect.id)">{{ data.prospect.fullName }}</button>
        </template>
      </Column>
      <Column field="position" header="Pos" sortable frozen style="min-width: 5rem">
        <template #body="{ data }">{{ data.prospect.position }}</template>
      </Column>
      <Column field="college" header="College" sortable style="min-width: 11rem">
        <template #body="{ data }">{{ data.prospect.college }}</template>
      </Column>
      <Column field="draftYear" header="Year" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ data.prospect.draftYear ?? '—' }}</template>
      </Column>
      <Column field="height" header="Height" sortable style="min-width: 7rem">
        <template #body="{ data }">{{ formatHeightMeasurement(score(data)?.height) }}</template>
      </Column>
      <Column field="weight" header="Wt" sortable style="min-width: 5rem">
        <template #body="{ data }">{{ formatWeight(score(data)?.weight) }}</template>
      </Column>
      <Column field="handSize" header="Hands" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ formatScoutingInches(score(data)?.handSize) }}</template>
      </Column>
      <Column field="armLength" header="Arms" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ formatScoutingInches(score(data)?.armLength) }}</template>
      </Column>
      <Column field="fortyTime" header="40" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ formatTimeMeasurement(score(data)?.fortyTime) }}</template>
      </Column>
      <Column field="tenYardSplit" header="10 Split" sortable style="min-width: 7rem">
        <template #body="{ data }">{{ formatTimeMeasurement(score(data)?.tenYardSplit) }}</template>
      </Column>
      <Column field="verticalLeap" header="Vert" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ formatDistanceMeasurement(score(data)?.verticalLeap) }}</template>
      </Column>
      <Column field="broadJump" header="Broad" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ formatDistanceMeasurement(score(data)?.broadJump) }}</template>
      </Column>
      <Column field="threeCone" header="3-Cone" sortable style="min-width: 7rem">
        <template #body="{ data }">{{ formatTimeMeasurement(score(data)?.threeCone) }}</template>
      </Column>
      <Column field="twentyYardShuttle" header="Shuttle" sortable style="min-width: 7rem">
        <template #body="{ data }">{{ formatTimeMeasurement(score(data)?.twentyYardShuttle) }}</template>
      </Column>
      <Column field="benchPress" header="Bench" sortable style="min-width: 6rem">
        <template #body="{ data }">{{ formatReps(score(data)?.benchPress) }}</template>
      </Column>
      <Column header="Status" style="min-width: 7rem">
        <template #body="{ data }"><Tag :value="data.combineStatus" :severity="statusSeverity(data.combineStatus)" /></template>
      </Column>
      <Column header="Actions" frozen alignFrozen="right" style="min-width: 10rem">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button icon="pi pi-user" text rounded v-tooltip.top="'View Prospect'" @click="viewProspect(data.prospect.id)" />
            <template v-if="data.combineScore?.id">
              <Button icon="pi pi-eye" text rounded v-tooltip.top="'View Measurements'" @click="viewCombineScore(data.combineScore.id)" />
              <Button icon="pi pi-pencil" text rounded v-tooltip.top="'Edit Measurements'" @click="editCombineScore(data.combineScore.id)" />
              <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'Delete Measurements'" @click="deleteCombineScore(data.combineScore.id, data.prospect.fullName)" />
            </template>
            <Button v-else label="Add" icon="pi pi-plus" size="small" @click="createCombineScore(data.prospect.id)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </section>
</template>

<style scoped>
.combine-workspace{width:100%;min-width:0}.page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem}.page-header h1{margin:0;font-size:1.75rem}.page-header p{margin:.35rem 0 0;color:var(--text-color-secondary)}.filters-panel{display:grid;grid-template-columns:repeat(5,minmax(9rem,1fr)) auto;gap:.75rem;align-items:end;padding:1rem;margin-bottom:1rem;border:1px solid var(--surface-border);border-radius:6px;background:var(--surface-card)}.filter-field{display:flex;flex-direction:column;gap:.35rem;min-width:0}.filter-field label{font-size:.85rem;font-weight:600}.filter-field :deep(.p-dropdown),.filter-field :deep(.p-inputtext){width:100%}.filter-actions{display:flex;gap:.5rem;white-space:nowrap}.prospect-link{padding:0;border:0;background:none;color:var(--primary-color);font:inherit;font-weight:600;cursor:pointer;text-align:left}.prospect-link:hover{text-decoration:underline}.action-buttons{display:flex;align-items:center;gap:.15rem}.error-message{margin-bottom:1rem;padding:.75rem;border-radius:4px;background:var(--red-50);color:var(--red-700)}@media(max-width:1250px){.filters-panel{grid-template-columns:repeat(3,minmax(10rem,1fr))}.filter-actions{align-self:end}}@media(max-width:760px){.page-header{flex-direction:column}.filters-panel{grid-template-columns:1fr}.filter-actions{flex-wrap:wrap}}
</style>
