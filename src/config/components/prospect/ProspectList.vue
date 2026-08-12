<!-- src/components/prospect/ProspectList.vue -->
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

interface PageEvent { page: number; rows: number }
const prospectStore = useProspectStore()
const router = useRouter()
const currentYear = new Date().getFullYear()
const draftYears = Array.from({ length: 16 }, (_, index) => currentYear + 2 - index)
const positions = ['QB','RB','WR','TE','OT','IOL','C','EDGE','DL','DT','LB','CB','S','K','P']
const filters = reactive<{ draftYear?: number; position?: string; college: string; playerName: string }>({ college: '', playerName: '' })

const loadProspects = (page = 1, pageSize = prospectStore.pagination.limit || 25) => prospectStore.fetchAll({
  page, pageSize, draftYear: filters.draftYear, position: filters.position, college: filters.college.trim() || undefined, playerName: filters.playerName.trim() || undefined,
})

onMounted(() => { void loadProspects() })
const applyFilters = () => { void loadProspects(1) }
const clearFilters = () => { filters.draftYear = undefined; filters.position = undefined; filters.college = ''; filters.playerName = ''; void loadProspects(1) }
const onPage = (event: PageEvent) => { void loadProspects(event.page + 1, event.rows) }
const viewProspect = (id: number) => router.push(`/prospects/${id}`)
const editProspect = (id: number) => router.push(`/prospects/${id}/edit`)
const createProspect = () => router.push('/prospects/new')
const deleteProspect = async (id: number) => { if (confirm('Are you sure you want to delete this prospect?')) await prospectStore.remove(id) }
const getPositionSeverity = (position: string) => ({ QB:'danger', RB:'success', WR:'warning', TE:'info', LB:'primary' } as Record<string,string>)[position] || 'secondary'
</script>

<template>
  <div class="prospect-list">
    <div class="list-header"><h2>Prospects</h2><Button label="Create Prospect" icon="pi pi-plus" @click="createProspect" /></div>
    <div class="filters">
      <Dropdown v-model="filters.draftYear" :options="draftYears" placeholder="Draft Year" showClear />
      <Dropdown v-model="filters.position" :options="positions" placeholder="Position" showClear />
      <InputText v-model="filters.college" placeholder="College" @keyup.enter="applyFilters" />
      <InputText v-model="filters.playerName" placeholder="Player Name" @keyup.enter="applyFilters" />
      <Button label="Search" icon="pi pi-search" @click="applyFilters" />
      <Button label="Clear" icon="pi pi-times" severity="secondary" outlined @click="clearFilters" />
    </div>
    <DataTable :value="prospectStore.prospects" :loading="prospectStore.loading" lazy paginator
      :rows="prospectStore.pagination.limit" :first="(prospectStore.pagination.page - 1) * prospectStore.pagination.limit"
      :rowsPerPageOptions="[10,25,50,100]" :totalRecords="prospectStore.pagination.total" responsiveLayout="scroll" @page="onPage">
      <Column header="Name"><template #body="{ data }"><button class="name-link" @click="viewProspect(data.id)">{{ data.firstName }} {{ data.lastName }}</button></template></Column>
      <Column field="position" header="Position"><template #body="{ data }"><Tag :value="data.position" :severity="getPositionSeverity(data.position)" /></template></Column>
      <Column field="college" header="College" />
      <Column field="draftYear" header="Draft Year" />
      <Column header="Combine"><template #body="{ data }"><Tag :value="data.hasCompleteCombineScores ? 'Available' : 'Incomplete'" :severity="data.hasCompleteCombineScores ? 'success' : 'secondary'" /></template></Column>
      <Column header="Actions"><template #body="{ data }"><div class="action-buttons"><Button icon="pi pi-eye" text @click="viewProspect(data.id)" /><Button icon="pi pi-pencil" text @click="editProspect(data.id)" /><Button icon="pi pi-trash" text severity="danger" @click="deleteProspect(data.id)" /></div></template></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.list-header,.filters,.action-buttons{display:flex;align-items:center;gap:.75rem}.list-header{justify-content:space-between;margin-bottom:1rem}.filters{flex-wrap:wrap;margin-bottom:1rem}.name-link{border:0;background:none;padding:0;color:var(--primary-color);cursor:pointer;font-weight:600}.action-buttons{gap:.25rem}
</style>
