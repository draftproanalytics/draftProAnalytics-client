<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import { buildTeamNeedsApi } from '../../infrastructure/TeamNeedsApi'
import type { PlayerSeasonEvaluationDto, RosterPlayerOptionDto, TeamPositionAssessmentDto, TeamPositionContextCatalogDto, TeamPositionContextDto } from '../../domain/dtos/TeamNeedDtos'

const props = defineProps<{ teamId: number; draftYear: number }>()
const api = buildTeamNeedsApi()
const positions = ['QB','RB','WR','TE','OT','IOL','EDGE','DT','LB','CB','S','K','P']
const sourceTypes = ['MANUAL_ANALYST','PFF_MANUAL','CSV_IMPORT','NFLVERSE','OTHER_LICENSED_PROVIDER']
const loading = ref(false)
const roster = ref<RosterPlayerOptionDto[]>([])
const evaluations = ref<PlayerSeasonEvaluationDto[]>([])
const catalog = ref<TeamPositionContextCatalogDto[]>([])
const contexts = ref<TeamPositionContextDto[]>([])
const assessments = ref<TeamPositionAssessmentDto[]>([])
const evaluationDialog = ref(false)
const contextDialog = ref(false)
const assessmentDialog = ref(false)

const evaluation = reactive<PlayerSeasonEvaluationDto>({ rosterPlayerId:'', teamId:props.teamId, seasonYear:props.draftYear-1, position:'WR', sourceType:'MANUAL_ANALYST', sourceName:'DPA Analyst', verified:false, effectiveAsOfDate:new Date().toISOString().slice(0,10) })
const context = reactive<TeamPositionContextDto>({ teamId:props.teamId, draftYear:props.draftYear, position:'WR', riskLevel:'HIGH', summary:'', source:'MANUAL', status:'APPROVED', analystConfidence:100 })
const assessment = reactive<TeamPositionAssessmentDto>({ teamId:props.teamId, draftYear:props.draftYear, seasonYear:props.draftYear-1, position:'WR', assessmentType:'MANUAL', algorithmVersion:'team-needs-v4', dataConfidence:70, status:'APPROVED' })

const selectedPlayer = computed(() => roster.value.find((row) => String(row.id) === evaluation.rosterPlayerId))

async function loadAll(): Promise<void> {
  if (!Number.isInteger(props.teamId)) return
  loading.value = true
  try {
    const seasonYear = props.draftYear - 1
    ;[roster.value, evaluations.value, catalog.value, contexts.value, assessments.value] = await Promise.all([
      api.getRosterPlayers(props.teamId), api.getPlayerEvaluations(props.teamId, seasonYear), api.getContextCatalog(), api.getPositionContexts(props.teamId, props.draftYear), api.getPositionAssessments(props.teamId, props.draftYear)
    ])
  } finally { loading.value = false }
}

function openEvaluation(row?: PlayerSeasonEvaluationDto): void {
  Object.assign(evaluation, row ?? { id:undefined, rosterPlayerId:'', teamId:props.teamId, seasonYear:props.draftYear-1, position:'WR', sourceType:'MANUAL_ANALYST', sourceName:'DPA Analyst', sourceReference:null, overallGrade:null, positionRank:null, qualifyingPlayerCount:null, passBlockGrade:null, runBlockGrade:null, receivingGrade:null, coverageGrade:null, passRushGrade:null, verified:false, effectiveAsOfDate:new Date().toISOString().slice(0,10) })
  evaluationDialog.value = true
}
function openContext(row?: TeamPositionContextDto): void {
  Object.assign(context, row ?? { id:undefined, teamId:props.teamId, draftYear:props.draftYear, position:'WR', contextCatalogId:null, riskLevel:'HIGH', appliedWeight:null, analystConfidence:100, summary:'', source:'MANUAL', status:'APPROVED' })
  contextDialog.value = true
}
function openAssessment(row?: TeamPositionAssessmentDto): void {
  Object.assign(assessment, row ?? { id:undefined, teamId:props.teamId, draftYear:props.draftYear, seasonYear:props.draftYear-1, position:'WR', assessmentType:'MANUAL', algorithmVersion:'team-needs-v4', rosterCountScore:null, topStarterScore:null, secondStarterScore:null, depthQualityScore:null, productionScore:null, assignmentGradeScore:null, roleCompletenessScore:null, contextRiskScore:null, dataConfidence:70, analystOverrideScore:null, reason:'', status:'APPROVED' })
  assessmentDialog.value = true
}

async function saveEvaluation(): Promise<void> { if (selectedPlayer.value) evaluation.position = selectedPlayer.value.position; await api.savePlayerEvaluation({ ...evaluation }); evaluationDialog.value=false; await loadAll() }
async function saveContext(): Promise<void> { const item=catalog.value.find((x)=>x.id===context.contextCatalogId); if(item){ context.appliedWeight ??= Number(item.defaultWeight); context.summary ||= item.displayName } await api.savePositionContext({ ...context }); contextDialog.value=false; await loadAll() }
async function saveAssessment(): Promise<void> { await api.savePositionAssessment({ ...assessment }); assessmentDialog.value=false; await loadAll() }
async function removeEvaluation(id?: string): Promise<void> { if(id){ await api.deletePlayerEvaluation(id); await loadAll() } }
async function removeContext(id?: string): Promise<void> { if(id){ await api.deletePositionContext(id); await loadAll() } }
async function removeAssessment(id?: string): Promise<void> { if(id){ await api.deletePositionAssessment(id); await loadAll() } }

watch(() => [props.teamId, props.draftYear], loadAll)
onMounted(loadAll)
</script>

<template>
  <div class="grid gap-4" style="grid-template-columns: 1fr;">
    <Card>
      <template #title><div class="flex justify-content-between align-items-center"><span>Player evaluations</span><Button label="Add evaluation" icon="pi pi-plus" size="small" @click="openEvaluation()" /></div></template>
      <template #content>
        <DataTable :value="evaluations" :loading="loading" responsiveLayout="scroll">
          <Column field="position" header="Pos" /><Column field="overallGrade" header="Overall" /><Column field="positionRank" header="Rank" /><Column field="qualifyingPlayerCount" header="Qualifiers" /><Column field="passBlockGrade" header="Pass block" /><Column field="receivingGrade" header="Receiving" /><Column field="coverageGrade" header="Coverage" /><Column field="sourceName" header="Source" />
          <Column header="Verified"><template #body="{data}"><Tag :value="data.verified ? 'Verified' : 'Unverified'" :severity="data.verified ? 'success' : 'warning'" /></template></Column>
          <Column header="Actions"><template #body="{data}"><Button icon="pi pi-pencil" text @click="openEvaluation(data)" /><Button icon="pi pi-trash" text severity="danger" @click="removeEvaluation(data.id)" /></template></Column>
        </DataTable>
      </template>
    </Card>

    <Card>
      <template #title><div class="flex justify-content-between align-items-center"><span>Analyst context</span><Button label="Add context" icon="pi pi-plus" size="small" @click="openContext()" /></div></template>
      <template #content>
        <DataTable :value="contexts" :loading="loading" responsiveLayout="scroll">
          <Column field="position" header="Pos" /><Column header="Judgment"><template #body="{data}">{{ data.TeamPositionContextCatalog?.displayName ?? data.contextType }}</template></Column><Column field="appliedWeight" header="Weight" /><Column field="analystConfidence" header="Confidence" /><Column field="contextScore" header="Risk score" /><Column field="summary" header="Summary" />
          <Column header="Actions"><template #body="{data}"><Button icon="pi pi-pencil" text @click="openContext(data)" /><Button icon="pi pi-trash" text severity="danger" @click="removeContext(data.id)" /></template></Column>
        </DataTable>
      </template>
    </Card>

    <Card>
      <template #title><div class="flex justify-content-between align-items-center"><span>Position-room assessments</span><Button label="Assess position" icon="pi pi-chart-bar" size="small" @click="openAssessment()" /></div></template>
      <template #content>
        <DataTable :value="assessments" :loading="loading" responsiveLayout="scroll">
          <Column field="position" header="Pos" /><Column field="topStarterScore" header="Top starter" /><Column field="secondStarterScore" header="Second" /><Column field="depthQualityScore" header="Depth" /><Column field="productionScore" header="Production" /><Column field="roleCompletenessScore" header="Role fit" /><Column field="contextRiskScore" header="Context risk" /><Column field="finalNeedScore" header="Need score" /><Column field="priority" header="Priority" /><Column field="reason" header="Reason" />
          <Column header="Actions"><template #body="{data}"><Button icon="pi pi-pencil" text @click="openAssessment(data)" /><Button icon="pi pi-trash" text severity="danger" @click="removeAssessment(data.id)" /></template></Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="evaluationDialog" modal header="Player season evaluation" :style="{width:'54rem'}">
      <div class="grid gap-3" style="grid-template-columns: repeat(3, 1fr);">
        <div><label>Player</label><Dropdown v-model="evaluation.rosterPlayerId" :options="roster" optionLabel="playerName" optionValue="id" filter class="w-full" /></div>
        <div><label>Season</label><InputNumber v-model="evaluation.seasonYear" :useGrouping="false" class="w-full" /></div>
        <div><label>Position</label><Dropdown v-model="evaluation.position" :options="positions" class="w-full" /></div>
        <div><label>Source type</label><Dropdown v-model="evaluation.sourceType" :options="sourceTypes" class="w-full" /></div>
        <div><label>Source name</label><InputText v-model="evaluation.sourceName" class="w-full" /></div>
        <div><label>Source reference</label><InputText v-model="evaluation.sourceReference" class="w-full" /></div>
        <div><label>Overall grade</label><InputNumber v-model="evaluation.overallGrade" class="w-full" /></div>
        <div><label>Position rank</label><InputNumber v-model="evaluation.positionRank" class="w-full" /></div>
        <div><label>Qualifying players</label><InputNumber v-model="evaluation.qualifyingPlayerCount" class="w-full" /></div>
        <div><label>Pass-block grade</label><InputNumber v-model="evaluation.passBlockGrade" class="w-full" /></div>
        <div><label>Run-block grade</label><InputNumber v-model="evaluation.runBlockGrade" class="w-full" /></div>
        <div><label>Receiving grade</label><InputNumber v-model="evaluation.receivingGrade" class="w-full" /></div>
        <div><label>Coverage grade</label><InputNumber v-model="evaluation.coverageGrade" class="w-full" /></div>
        <div><label>Pass-rush grade</label><InputNumber v-model="evaluation.passRushGrade" class="w-full" /></div>
        <div><label>Effective date</label><InputText v-model="evaluation.effectiveAsOfDate" class="w-full" /></div>
        <div class="flex align-items-center gap-2"><Checkbox v-model="evaluation.verified" binary inputId="verified" /><label for="verified">Verified</label></div>
      </div>
      <template #footer><Button label="Cancel" severity="secondary" @click="evaluationDialog=false" /><Button label="Save" @click="saveEvaluation" /></template>
    </Dialog>

    <Dialog v-model:visible="contextDialog" modal header="Team position context" :style="{width:'44rem'}">
      <div class="grid gap-3" style="grid-template-columns: 1fr 1fr;">
        <div><label>Position</label><Dropdown v-model="context.position" :options="positions" class="w-full" /></div>
        <div><label>Judgment</label><Dropdown v-model="context.contextCatalogId" :options="catalog" optionLabel="displayName" optionValue="id" filter class="w-full" /></div>
        <div><label>Applied weight</label><InputNumber v-model="context.appliedWeight" :min="0" :max="100" class="w-full" /></div>
        <div><label>Analyst confidence</label><InputNumber v-model="context.analystConfidence" :min="0" :max="100" class="w-full" /></div>
        <div style="grid-column:1/-1"><label>Summary</label><Textarea v-model="context.summary" rows="4" class="w-full" /></div>
      </div>
      <template #footer><Button label="Cancel" severity="secondary" @click="contextDialog=false" /><Button label="Save" @click="saveContext" /></template>
    </Dialog>

    <Dialog v-model:visible="assessmentDialog" modal header="Position-room assessment" :style="{width:'56rem'}">
      <Message severity="info" :closable="false">High component scores indicate strength. High context risk indicates greater need. The server calculates the final need score.</Message>
      <div class="grid gap-3 mt-3" style="grid-template-columns: repeat(3, 1fr);">
        <div><label>Position</label><Dropdown v-model="assessment.position" :options="positions" class="w-full" /></div>
        <div><label>Season evaluated</label><InputNumber v-model="assessment.seasonYear" :useGrouping="false" class="w-full" /></div>
        <div><label>Data confidence</label><InputNumber v-model="assessment.dataConfidence" :min="0" :max="100" class="w-full" /></div>
        <div><label>Roster-count score</label><InputNumber v-model="assessment.rosterCountScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Top-starter score</label><InputNumber v-model="assessment.topStarterScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Second-starter score</label><InputNumber v-model="assessment.secondStarterScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Depth-quality score</label><InputNumber v-model="assessment.depthQualityScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Production score</label><InputNumber v-model="assessment.productionScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Assignment-grade score</label><InputNumber v-model="assessment.assignmentGradeScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Role-completeness score</label><InputNumber v-model="assessment.roleCompletenessScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Context-risk score</label><InputNumber v-model="assessment.contextRiskScore" :min="0" :max="100" class="w-full" /></div>
        <div><label>Analyst override</label><InputNumber v-model="assessment.analystOverrideScore" :min="0" :max="100" class="w-full" /></div>
        <div style="grid-column:1/-1"><label>Reason</label><Textarea v-model="assessment.reason" rows="4" class="w-full" /></div>
      </div>
      <template #footer><Button label="Cancel" severity="secondary" @click="assessmentDialog=false" /><Button label="Save and calculate" @click="saveAssessment" /></template>
    </Dialog>
  </div>
</template>
