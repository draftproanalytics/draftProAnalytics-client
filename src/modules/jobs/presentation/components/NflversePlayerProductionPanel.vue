<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { dpaJobsApi } from '../../application/DpaJobsApi'
import type { NflverseProductionReviewRow, RosterMatchCandidate } from '../../domain/NflJobTypes'
const emit = defineEmits<{ readonly 'job-submitted': [jobId: number] }>()
const currentYear = new Date().getFullYear()
const seasonYear = ref(currentYear)
const draftYear = ref(currentYear + 1)
const summaryLevel = ref<'reg'|'post'|'regpost'>('reg')
const status = ref<string | undefined>(undefined)
const rows = ref<readonly NflverseProductionReviewRow[]>([])
const loading = ref(false); const message = ref(''); const error = ref('')
const matchDialog = ref(false); const selected = ref<NflverseProductionReviewRow | null>(null); const candidates = ref<readonly RosterMatchCandidate[]>([]); const selectedRosterId = ref<string | null>(null)
const summaryOptions = [{label:'Regular season',value:'reg'},{label:'Postseason',value:'post'},{label:'Regular + postseason',value:'regpost'}]
const statusOptions = [{label:'All',value:undefined},{label:'Unmatched',value:'UNMATCHED'},{label:'Auto matched',value:'AUTO_MATCHED'},{label:'Confirmed',value:'CONFIRMED'},{label:'Ignored',value:'IGNORED'},{label:'Promoted',value:'PROMOTED'}]
const candidateOptions = computed(() => candidates.value.map((c) => ({ label: `${c.playerName} — ${c.position}`, value: c.id })))
const refresh = async () => { loading.value=true; error.value=''; try { rows.value=await dpaJobsApi.listNflverseProductionReview(seasonYear.value,status.value) } catch(e){ error.value=e instanceof Error?e.message:'Unable to load review rows.' } finally { loading.value=false } }
const submit = async () => { loading.value=true; error.value=''; try { const job=await dpaJobsApi.enqueueImportNflversePlayerProduction({seasonYear:seasonYear.value,summaryLevel:summaryLevel.value}); message.value=`Queued player production job ${job.id}.`; emit('job-submitted',job.id) } catch(e){ error.value=e instanceof Error?e.message:'Unable to queue import.' } finally { loading.value=false } }
const openMatch = async (row:NflverseProductionReviewRow) => { selected.value=row; selectedRosterId.value=row.matchedRosterPlayerId; candidates.value=await dpaJobsApi.listNflverseMatchCandidates(row.id); matchDialog.value=true }
const saveMatch = async () => { if(!selected.value||!selectedRosterId.value)return; await dpaJobsApi.updateNflverseMatch(selected.value.id,selectedRosterId.value,'CONFIRMED'); matchDialog.value=false; await refresh() }
const ignore = async (row:NflverseProductionReviewRow) => { await dpaJobsApi.updateNflverseMatch(row.id,null,'IGNORED'); await refresh() }
const promote = async () => { const result=await dpaJobsApi.promoteNflverseProduction(seasonYear.value); message.value=`Promoted ${result.promoted}; skipped ${result.skipped}.`; await refresh() }
const recalculate = async () => { const result=await dpaJobsApi.recalculateNflverseAssessments(seasonYear.value,draftYear.value); message.value=`Updated ${result.assessmentsUpdated} position assessments.` }
onMounted(refresh)
</script>
<template>
  <Card><template #title>Player Performance Import</template><template #subtitle>Import nflverse season statistics, review player matches, promote evaluations, and recalculate v4 assessments.</template><template #content>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message><Message v-if="message" severity="success" :closable="true" @close="message=''">{{ message }}</Message>
    <div class="controls"><span><label>Season</label><InputNumber v-model="seasonYear" :use-grouping="false" /></span><span><label>Summary</label><Dropdown v-model="summaryLevel" :options="summaryOptions" option-label="label" option-value="value" /></span><Button label="Queue Import" icon="pi pi-download" :loading="loading" @click="submit" /></div>
    <div class="toolbar"><Dropdown v-model="status" :options="statusOptions" option-label="label" option-value="value" placeholder="Review status" /><Button label="Refresh" icon="pi pi-refresh" outlined @click="refresh" /><Button label="Promote Matched" icon="pi pi-check" severity="success" @click="promote" /><InputNumber v-model="draftYear" :use-grouping="false" /><Button label="Recalculate Assessments" icon="pi pi-chart-line" @click="recalculate" /></div>
    <DataTable :value="rows" :loading="loading" paginator :rows="15" responsive-layout="scroll" data-key="id">
      <Column field="playerName" header="Imported Player" sortable /><Column field="teamAbbreviation" header="Team" sortable /><Column field="position" header="Position" sortable />
      <Column header="Match"><template #body="{data}">{{ data.matchedRosterPlayerId || '—' }}</template></Column>
      <Column header="Confidence"><template #body="{data}">{{ data.matchConfidence ?? '—' }}</template></Column>
      <Column header="Status" field="matchStatus"><template #body="{data}"><Tag :value="data.matchStatus" /></template></Column>
      <Column header="Production"><template #body="{data}">{{ data.metricsJson.receiving_yards ?? data.metricsJson.rushing_yards ?? data.metricsJson.passing_yards ?? data.metricsJson.sacks ?? '—' }}</template></Column>
      <Column header="Actions"><template #body="{data}"><div class="actions"><Button icon="pi pi-link" text rounded aria-label="Match" @click="openMatch(data)"/><Button icon="pi pi-ban" text rounded severity="danger" aria-label="Ignore" @click="ignore(data)"/></div></template></Column>
    </DataTable>
  </template></Card>
  <Dialog v-model:visible="matchDialog" modal header="Match Imported Player" :style="{width:'34rem'}"><p v-if="selected"><strong>{{ selected.playerName }}</strong> — {{ selected.teamAbbreviation }} {{ selected.position }}</p><Dropdown v-model="selectedRosterId" :options="candidateOptions" option-label="label" option-value="value" filter class="w-full" placeholder="Choose roster player"/><template #footer><Button label="Cancel" text @click="matchDialog=false"/><Button label="Confirm Match" :disabled="!selectedRosterId" @click="saveMatch"/></template></Dialog>
</template>
<style scoped>.controls,.toolbar,.actions{display:flex;gap:.75rem;align-items:end;flex-wrap:wrap}.controls,.toolbar{margin-bottom:1rem}.controls span{display:flex;flex-direction:column;gap:.35rem}.w-full{width:100%}</style>
