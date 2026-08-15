<!-- src/components/player/PlayerList.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { DataTablePageEvent, DataTableSortEvent } from 'primevue/datatable'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import type { PlayerSortField } from '@/services/playerService'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const playerStore = usePlayerStore()
const router = useRouter()
const playerNameSearch = ref(playerStore.searchTerm)

onMounted(() => {
  void playerStore.fetchPage(1, playerStore.rowsPerPage)
})

const onPage = (event: DataTablePageEvent): void => {
  void playerStore.fetchPage(event.page + 1, event.rows)
}

const onSort = (event: DataTableSortEvent): void => {
  const allowedFields: PlayerSortField[] = ['firstName', 'lastName', 'position', 'university']
  const field = typeof event.sortField === 'string' && allowedFields.includes(event.sortField as PlayerSortField)
    ? event.sortField as PlayerSortField
    : undefined
  const order = event.sortOrder === 1 || event.sortOrder === -1 ? event.sortOrder : undefined
  void playerStore.setSort(field, order)
}

const searchPlayers = (): void => {
  void playerStore.searchByName(playerNameSearch.value)
}

const clearSearch = (): void => {
  playerNameSearch.value = ''
  void playerStore.clearSearch()
}

const viewPlayer = (id: number) => {
  router.push(`/players/${id}?mode=read`)
}

const editPlayer = (id: number) => {
  router.push(`/players/${id}?mode=edit`)
}

const createPlayer = () => {
  router.push('/players?mode=create')
}

const deletePlayer = async (id: number) => {
  if (confirm('Are you sure you want to delete this player?')) {
    await playerStore.remove(id)
  }
}
</script>

<template>
  <div class="team-list">
    <div class="list-header bg-team-primary text-team-accent">
      <h2>Players</h2>
      <div class="header-actions">
        <div class="player-search">
          <i class="pi pi-search" aria-hidden="true" />
          <InputText
            v-model="playerNameSearch"
            placeholder="Search player name"
            aria-label="Search by player name"
            @keyup.enter="searchPlayers"
          />
          <Button label="Search" icon="pi pi-search" @click="searchPlayers" />
          <Button
            label="Clear"
            icon="pi pi-times"
            severity="secondary"
            outlined
            :disabled="!playerNameSearch && !playerStore.searchTerm"
            @click="clearSearch"
          />
        </div>
        <Button @click="createPlayer" label="Create Player" icon="pi pi-plus" class="p-button-success" />
      </div>
    </div>

    <DataTable
      :value="playerStore.players"
      :loading="playerStore.loading"
      paginator
      lazy
      :first="(playerStore.page - 1) * playerStore.rowsPerPage"
      :rows="playerStore.rowsPerPage"
      :totalRecords="playerStore.totalRecords"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :sortField="playerStore.sortField"
      :sortOrder="playerStore.sortOrder"
      responsiveLayout="scroll"
      class="themed-datatable"
      @page="onPage"
      @sort="onSort"
    >
      <Column field="firstName" header="First Name" sortable />
      <Column field="lastName" header="Last Name" sortable />
      <Column field="position" header="Position" sortable />
      <Column field="team.name" header="Team" />
      <Column field="university" header="University" sortable />
      <Column header="Actions">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button @click="viewPlayer(data.id)" icon="pi pi-eye" class="p-button-info p-button-sm" v-tooltip="'View'" />
            <Button @click="editPlayer(data.id)" icon="pi pi-pencil" class="p-button-warning p-button-sm" v-tooltip="'Edit'" />
            <Button @click="deletePlayer(data.id)" icon="pi pi-trash" class="p-button-danger p-button-sm" v-tooltip="'Delete'" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.team-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.list-header h2 {
  margin: 0;
}

.header-actions,
.player-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-search :deep(.p-inputtext) {
  width: 15rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 900px) {
  .list-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
