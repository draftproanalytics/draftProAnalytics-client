<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import { useRosterPlayerStore } from '../../application/stores/rosterPlayerStore'

const props = defineProps<{
  teamId?: number
}>()

const rosterPlayerStore = useRosterPlayerStore()
const playerNameSearch = ref('')
const selectedPosition = ref<string | null>(null)
const selectedStatus = ref<'Active' | 'Inactive' | null>(null)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const rosterPlayers = computed(() => rosterPlayerStore.teamRosterPlayers)

const positionOptions = computed<string[]>(() =>
  [...new Set(
    rosterPlayers.value
      .map((membership) => membership.position?.trim())
      .filter((position): position is string => Boolean(position)),
  )].sort((left, right) => left.localeCompare(right)),
)

const statusOptions: Array<'Active' | 'Inactive'> = ['Active', 'Inactive']

const filteredRosterPlayers = computed(() => {
  const search = playerNameSearch.value.trim().toLowerCase()

  return rosterPlayers.value.filter((membership) => {
    const matchesName = !search || membership.playerName.toLowerCase().includes(search)
    const matchesPosition = !selectedPosition.value || membership.position === selectedPosition.value
    const matchesStatus =
      !selectedStatus.value ||
      (selectedStatus.value === 'Active' ? membership.isActive : !membership.isActive)

    return matchesName && matchesPosition && matchesStatus
  })
})

const loadRoster = async (): Promise<void> => {
  if (!props.teamId) return
  await rosterPlayerStore.fetchByTeamId(props.teamId)
}

const hasActiveFilters = computed(
  () => Boolean(playerNameSearch.value.trim() || selectedPosition.value || selectedStatus.value),
)

const clearFilters = (): void => {
  playerNameSearch.value = ''
  selectedPosition.value = null
  selectedStatus.value = null
}

const positionSeverity = (position: string | null): 'info' | 'success' | 'warning' | 'secondary' => {
  if (!position) return 'secondary'
  if (['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'OG', 'T', 'OT', 'OL'].includes(position)) return 'info'
  if (['K', 'P', 'LS', 'RET'].includes(position)) return 'warning'
  return 'success'
}

onMounted(loadRoster)
watch(() => props.teamId, loadRoster)
</script>

<template>
  <section class="team-roster-list">
    <div class="roster-toolbar">
      <h2>Team Roster</h2>

      <span class="player-search">
        <i class="pi pi-search" />
        <InputText
          v-model="playerNameSearch"
          placeholder="Search player"
          aria-label="Search roster by player name"
        />
      </span>

      <Dropdown
        v-model="selectedPosition"
        :options="positionOptions"
        placeholder="Position"
        showClear
        class="roster-filter position-filter"
        aria-label="Filter roster by position"
      />

      <Dropdown
        v-model="selectedStatus"
        :options="statusOptions"
        placeholder="Status"
        showClear
        class="roster-filter status-filter"
        aria-label="Filter roster by status"
      />

      <Button
        icon="pi pi-refresh"
        label="Refresh"
        severity="secondary"
        outlined
        :loading="rosterPlayerStore.loading"
        @click="loadRoster"
      />

      <Button
        icon="pi pi-times"
        label="Clear"
        severity="secondary"
        text
        :disabled="!hasActiveFilters"
        @click="clearFilters"
      />
    </div>

    <div class="roster-count">
      {{ filteredRosterPlayers.length }} player{{ filteredRosterPlayers.length === 1 ? '' : 's' }}
    </div>

    <div v-if="rosterPlayerStore.error" class="error-message">
      {{ rosterPlayerStore.error }}
    </div>

    <DataTable
        v-model:filters="filters"
        :value="filteredRosterPlayers"
        :loading="rosterPlayerStore.loading"
        paginator
        :rows="20"
        :rowsPerPageOptions="[10, 20, 50, 100]"
        scrollable
        scrollHeight="32rem"
        responsiveLayout="scroll"
        sortField="lastName"
        :sortOrder="1"
        dataKey="playerTeamId"
        stripedRows
        removableSort
      >
      <Column field="playerName" header="Player" sortable>
        <template #body="{ data }">
          <div class="player-cell">
            <strong>{{ data.playerName }}</strong>
            <small v-if="data.university">{{ data.university }}</small>
          </div>
        </template>
      </Column>

      <Column field="position" header="Position" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.position || 'Unknown'"
            :severity="positionSeverity(data.position)"
            class="roster-position-tag"
          />
        </template>
      </Column>

      <Column field="jerseyNumber" header="No." sortable>
        <template #body="{ data }">
          {{ data.jerseyNumber ?? '—' }}
        </template>
      </Column>

      <Column field="age" header="Age" sortable />

      <Column field="yearsExperience" header="Experience" sortable>
        <template #body="{ data }">
          {{ data.yearsExperience === 0 ? 'Rookie' : `${data.yearsExperience} yr` }}
        </template>
      </Column>

      <Column field="startYear" header="Joined" sortable>
        <template #body="{ data }">
          {{ data.startYear ?? '—' }}
        </template>
      </Column>

      <Column field="isActive" header="Status" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.isActive ? 'Active' : 'Inactive'"
            :severity="data.isActive ? 'success' : 'secondary'"
            class="roster-status-tag"
          />
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-users" />
          <p>{{ hasActiveFilters ? 'No players match the selected filters.' : 'No current team assignments were found.' }}</p>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<style scoped>
.team-roster-list { width: 100%; }
.roster-toolbar { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.35rem; flex-wrap: nowrap; }
.roster-toolbar h2 { margin: 0; margin-right: auto; white-space: nowrap; }
.roster-count { display: block; margin-bottom: 1rem; color: var(--text-color-secondary); font-size: 0.9rem; }

.roster-filter { flex: 0 0 9rem; }
.position-filter { min-width: 8.5rem; }
.status-filter { min-width: 8.5rem; }
.player-cell { display: flex; flex-direction: column; gap: 0.15rem; }
.player-cell small { color: var(--text-color-secondary); }

.player-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 1 16.5rem;
  min-width: 12rem;
}

.player-search > i {
  flex: 0 0 auto;
}

.player-search :deep(.p-inputtext) {
  width: 100%;
}

/* PrimeVue applies severity text colors on the rendered Tag internals.
   The global rule below overrides those theme selectors. */
.error-message { margin-bottom: 1rem; padding: 0.75rem 1rem; border-radius: 6px; background: var(--red-50); color: var(--red-700); }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--text-color-secondary); }
.empty-state i { font-size: 2.5rem; }
.empty-state p { margin: 0; }
@media (max-width: 960px) {
  .roster-toolbar { flex-wrap: wrap; }
  .roster-toolbar h2 { width: 100%; margin-right: 0; }
  .player-search { flex: 1 1 16.5rem; }
  .roster-filter { flex: 1 1 9rem; }
}

@media (max-width: 720px) {
  .player-search,
  .roster-filter { width: 100%; flex-basis: 100%; }
}

.roster-position-tag.p-tag,
.roster-status-tag.p-tag,
.roster-position-tag.p-tag .p-tag-value,
.roster-status-tag.p-tag .p-tag-value {
  color: #000000 !important;
}
</style>
