<template>
  <div class="page">
    <div class="header-row">
      <div>
        <h1 class="b4me-title">
          <span class="b4m">B4Me Analysis</span>
          <span class="b4me">Big 4 Metrics Enhanced</span>
        </h1>
        <p class="research-attribution">
          Built on the Big 4 Metrics research concepts developed and published by Michael Nania,
          and extended within DraftProAnalytics.
        </p>
      </div>
      <B4MeVersionBadge :framework-version="store.methodology?.frameworkVersion ?? null" />
    </div>

    <Card class="search-card">
      <template #content>
        <div class="filters">
          <div class="field">
            <label for="positionGroup">Position Group</label>
            <Dropdown id="positionGroup" v-model="positionGroup" :options="positionOptions" optionLabel="label" optionValue="value" />
          </div>
          <div class="field">
            <label for="draftYear">Draft Year</label>
            <InputNumber id="draftYear" v-model="draftYear" :useGrouping="false" />
          </div>
          <div class="field prospect-search-field">
            <label for="playerName">Search Prospects</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText id="playerName" v-model="playerName" placeholder="Name or school" />
            </span>
          </div>
          <div class="field">
            <label for="scoringMode">Scoring Mode</label>
            <Dropdown id="scoringMode" v-model="scoringMode" :options="scoringModeOptions" optionLabel="label" optionValue="value" />
          </div>
        </div>

        <div class="toolbar-row">
          <div class="toggles">
            <div class="toggle"><Checkbox v-model="limitationFiltersEnabled" binary inputId="limitations" /><label for="limitations">Limitation Filters</label></div>
            <div class="toggle"><Checkbox v-model="decisionViewEnabled" binary inputId="decisionView" /><label for="decisionView">Decision View</label></div>
            <div class="toggle"><Checkbox v-model="includeMethodology" binary inputId="methodology" /><label for="methodology">Include Methodology</label></div>
            <div class="toggle"><Checkbox v-model="includeTeamContextPlaceholder" binary inputId="teamContext" /><label for="teamContext">Include Team Context</label></div>
          </div>
          <Button label="Run Analysis" icon="pi pi-play" :disabled="jobSubmitting || jobRunning || !canEditObservedMetrics || positionGroup !== 'WR'" @click="requestRunAnalysis" />
        </div>

        <div v-if="activeJobId !== null" class="job-progress">
          <div class="job-progress-header">
            <strong>B4Me WR Analysis — {{ draftYear }}</strong>
            <span>Status: {{ activeJobStatus.toUpperCase() }}</span>
          </div>
          <ProgressBar :value="activeJobProgress" />
          <div class="job-progress-details">{{ activeJobProcessed }} / {{ activeJobTotal }} processed · {{ activeJobProgress }}%</div>
          <div v-if="activeJobStatus === 'completed' && activeJobResult !== null" class="job-result-details">
            Evaluated: {{ resultCount('evaluated') }} · Reused: {{ resultCount('reused') }} ·
            Identity review: {{ resultCount('identityReviewRequired') }} · Duplicate review: {{ resultCount('duplicateReviewRequired') }} ·
            Provider unavailable: {{ resultCount('providerUnavailable') }} · Timeouts: {{ resultCount('providerTimeout') }} · Failed: {{ resultCount('failed') }}
          </div>
        </div>

        <ActiveFilterSummaryBadges :summary="store.activeFilterSummary" />
      </template>
    </Card>

    <Message v-if="store.error" severity="error" :closable="false">{{ store.error }}</Message>
    <ProgressSpinner v-if="store.loading" />

    <Message v-else-if="!store.loading && store.rows.length === 0" severity="info" :closable="false">
      No prospects matched the current filters.
    </Message>

    <div v-else class="workspace-grid">
      <Card class="prospect-card">
        <template #title>
          <div class="prospect-card-title">
            <span>Prospects</span>
            <small>{{ filteredRows.length }} shown</small>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="filteredRows"
            dataKey="prospectId"
            selectionMode="single"
            :selection="store.selectedRow"
            @row-click="onRowClick"
            scrollable
            scrollHeight="calc(100vh - 31rem)"
            paginator
            :rows="25"
            :rowsPerPageOptions="[25, 50, 100]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            class="prospect-table"
          >
            <Column field="playerName" header="Player" style="min-width: 11rem" />
            <Column field="school" header="School" style="min-width: 10rem">
              <template #body="slotProps">{{ slotProps.data.school ?? 'n/a' }}</template>
            </Column>
            <Column header="Research" style="min-width: 7rem">
              <template #body="slotProps">{{ slotProps.data.researchIndicators.thresholdsMet }}/{{ slotProps.data.researchIndicators.sourceBackedMetricCount }}</template>
            </Column>
            <Column header="B4Me" style="min-width: 9rem">
              <template #body="slotProps">
                <div class="score-cell">
                  <strong>{{ slotProps.data.evaluativeJudgment.finalB4MeAssessment.score }}</strong>
                  <span>{{ slotProps.data.evaluativeJudgment.finalB4MeAssessment.label }}</span>
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card class="detail-card">
        <template #content>
          <B4MeProspectDetailPanel
            :row="store.selectedRow"
            :can-edit-observed-metrics="canEditObservedMetrics"
            :methodology="store.methodology"
            :team-context="store.optionalTeamContext"
            @show-explanation="openExplanation"
            @edit-observed-metrics="openManualMetrics"
          />
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="preflightVisible" modal header="B4Me Pre-Analysis Check" :style="{ width: '36rem', maxWidth: '92vw' }" :closable="!jobSubmitting">
      <div v-if="preflightStatus" class="preflight-content">
        <p>Before evaluating the {{ preflightStatus.draftYear }} {{ preflightStatus.position }} class, we recommend running Prospect Duplicate &amp; Identity Review.</p>
        <Message :severity="preflightStatus.scanState === 'CURRENT' ? 'warn' : 'info'" :closable="false">
          Duplicate scan: <strong>{{ formatScanState(preflightStatus.scanState) }}</strong> ·
          {{ preflightStatus.prospectCount }} prospect(s) ·
          {{ preflightStatus.unresolvedDuplicateCount }} unresolved duplicate review(s) ·
          {{ preflightStatus.unresolvedIdentityCount }} unresolved identity review(s).
        </Message>
        <p>Any prospect with an unresolved duplicate or identity issue will automatically be skipped by the B4Me job.</p>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="preflightVisible = false" />
        <Button label="Continue B4Me Analysis" severity="secondary" outlined :disabled="jobSubmitting" @click="continueAfterPreflight" />
        <Button label="Run Duplicate Check First" icon="pi pi-search" :loading="duplicateScanSubmitting" @click="runDuplicateCheckFirst" />
      </template>
    </Dialog>

    <ManualWrObservedMetricsDialog v-model:visible="manualMetricsVisible" :row="store.selectedRow" :saving="manualMetricsSaving" :error="manualMetricsError" @save="saveManualMetrics" />
    <ScoreExplanationDrawer v-model:visible="scoreDrawerVisible" :explanation="activeExplanation" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import ProgressBar from 'primevue/progressbar';
import { useB4MeAnalysisStore } from '../stores/useB4MeAnalysisStore';
import { can } from '@/modules/accessControl/application/can';
import { prospectIdentityApi } from '@/modules/prospectIdentity/application/prospectIdentityApi';
import type { ProspectIdentityPreflightStatus } from '@/modules/prospectIdentity/domain/prospectIdentity.types';
import { enqueueB4MeWrEvaluation, readB4MeWrEvaluationJob, saveManualWrObservedMetrics } from '../services/b4meAnalysis.service';
import type { B4MeEvaluationRow, B4MePositionGroup, B4MeScoringMode, B4MeScoreExplanation, ManualWrObservedMetricsRequest } from '../types/b4meAnalysis';
import ActiveFilterSummaryBadges from '../components/ActiveFilterSummaryBadges.vue';
import B4MeProspectDetailPanel from '../components/B4MeProspectDetailPanel.vue';
import ManualWrObservedMetricsDialog from '../components/ManualWrObservedMetricsDialog.vue';
import B4MeVersionBadge from '../components/B4MeVersionBadge.vue';
import ScoreExplanationDrawer from '../components/ScoreExplanationDrawer.vue';

type RouteBooleanDefault = boolean;
function parseRouteBoolean(value: unknown, defaultValue: RouteBooleanDefault): boolean {
  if (typeof value !== 'string') return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return defaultValue;
}
function parseRouteNullableNumber(value: unknown, defaultValue: number | null): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}
function parseRouteScoringMode(value: unknown): B4MeScoringMode {
  return value === 'BASE_ONLY' || value === 'BASE_PLUS_CONTEXT' || value === 'FULL_DECISION_SCORE' ? value : 'BASE_PLUS_CONTEXT';
}
function parseRouteProspectId(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const route = useRoute();
const router = useRouter();
const store = useB4MeAnalysisStore();
const canEditObservedMetrics = computed<boolean>(() => can('SCOUTING', 'EDIT'));
const manualMetricsVisible = ref(false);
const manualMetricsSaving = ref(false);
const manualMetricsError = ref<string | null>(null);
const scoreDrawerVisible = ref(false);
const jobSubmitting = ref(false);
const duplicateScanSubmitting = ref(false);
const activeJobId = ref<number | null>(null);
const activeJobStatus = ref('idle');
const activeJobProgress = ref(0);
const activeJobTotal = ref(0);
const activeJobProcessed = ref(0);
const activeJobResult = ref<Record<string, unknown> | null>(null);
const preflightVisible = ref(false);
const preflightStatus = ref<ProspectIdentityPreflightStatus | null>(null);
const jobRunning = computed(() => activeJobStatus.value === 'pending' || activeJobStatus.value === 'in_progress');
let jobPollTimer: ReturnType<typeof setTimeout> | null = null;

const positionOptions: Array<{ label: string; value: B4MePositionGroup }> = [
  { label: 'Wide Receiver', value: 'WR' }, { label: 'Edge Defender', value: 'ED' }, { label: 'Offensive Tackle', value: 'OT' }, { label: 'Defensive Tackle', value: 'DT' }, { label: 'Cornerback', value: 'CB' }
];
const scoringModeOptions: Array<{ label: string; value: B4MeScoringMode }> = [
  { label: 'Base Only', value: 'BASE_ONLY' }, { label: 'Base Plus Context', value: 'BASE_PLUS_CONTEXT' }, { label: 'Full Decision Score', value: 'FULL_DECISION_SCORE' }
];
const positionGroup = ref<B4MePositionGroup>((route.query.positionGroup as B4MePositionGroup) || 'WR');
const draftYear = ref<number | null>(parseRouteNullableNumber(route.query.draftYear, new Date().getFullYear()));
const playerName = ref(typeof route.query.playerName === 'string' ? route.query.playerName : '');
const scoringMode = ref<B4MeScoringMode>(parseRouteScoringMode(route.query.scoringMode));
const limitationFiltersEnabled = ref(parseRouteBoolean(route.query.limitationFiltersEnabled, true));
const decisionViewEnabled = ref(parseRouteBoolean(route.query.decisionViewEnabled, true));
const includeMethodology = ref(parseRouteBoolean(route.query.includeMethodology, true));
const includeTeamContextPlaceholder = ref(parseRouteBoolean(route.query.includeTeamContextPlaceholder, true));

const filteredRows = computed<B4MeEvaluationRow[]>(() => {
  const term = playerName.value.trim().toLowerCase();
  if (!term) return store.rows;
  return store.rows.filter((row) => row.playerName.toLowerCase().includes(term) || (row.school ?? '').toLowerCase().includes(term));
});

const activeExplanation = computed<B4MeScoreExplanation | null>(() => {
  const row = store.selectedRow;
  if (!row) return null;
  return { title: `${row.playerName} B4Me evaluation`, summary: row.evaluativeJudgment.finalB4MeAssessment.explanation, lines: row.evaluativeJudgment.finalB4MeAssessment.projectionNote ? [row.evaluativeJudgment.finalB4MeAssessment.projectionNote] : [] };
});

function openManualMetrics(): void { manualMetricsError.value = null; manualMetricsVisible.value = true; }
async function saveManualMetrics(request: ManualWrObservedMetricsRequest): Promise<void> {
  if (store.selectedRow === null) return;
  const selectedId = store.selectedRow.prospectId;
  manualMetricsSaving.value = true;
  manualMetricsError.value = null;
  try {
    await saveManualWrObservedMetrics(selectedId, request);
    manualMetricsVisible.value = false;
    await runSearch();
    store.setSelectedProspectId(selectedId);
  } catch (error) {
    const axiosLike = error as { response?: { data?: { message?: string } } };
    manualMetricsError.value = axiosLike.response?.data?.message ?? (error instanceof Error ? error.message : 'Unable to save manual WR metrics.');
  } finally { manualMetricsSaving.value = false; }
}

async function requestRunAnalysis(): Promise<void> {
  if (draftYear.value === null || positionGroup.value !== 'WR') return;
  jobSubmitting.value = true;
  try {
    const status = await prospectIdentityApi.getPreflightStatus(draftYear.value, 'WR');
    preflightStatus.value = status;
    if (status.scanState === 'CURRENT' && status.unresolvedDuplicateCount === 0 && status.unresolvedIdentityCount === 0) {
      await runAnalysisJob();
      return;
    }
    preflightVisible.value = true;
  } catch (error) {
    const axiosLike = error as { response?: { data?: { message?: string } } };
    store.error = axiosLike.response?.data?.message ?? (error instanceof Error ? error.message : 'Unable to perform B4Me pre-analysis check.');
  } finally { jobSubmitting.value = false; }
}

async function continueAfterPreflight(): Promise<void> { preflightVisible.value = false; await runAnalysisJob(); }
async function runDuplicateCheckFirst(): Promise<void> {
  duplicateScanSubmitting.value = true;
  try {
    const job = await prospectIdentityApi.enqueueDuplicateScan();
    preflightVisible.value = false;
    await router.push({ name: 'ProspectIdentityManagement', query: { jobId: String(job.id) } });
  } catch (error) {
    store.error = error instanceof Error ? error.message : 'Unable to submit duplicate scan job.';
  } finally { duplicateScanSubmitting.value = false; }
}
function formatScanState(state: ProspectIdentityPreflightStatus['scanState']): string { return state === 'NEVER_RUN' ? 'Never run' : state === 'STALE' ? 'Stale' : 'Current'; }

async function runAnalysisJob(): Promise<void> {
  if (draftYear.value === null || positionGroup.value !== 'WR') return;
  jobSubmitting.value = true;
  try {
    const job = await enqueueB4MeWrEvaluation({ draftYear: draftYear.value, positionGroup: 'WR', refreshPolicy: 'MISSING_OR_STALE', scoringMode: scoringMode.value });
    activeJobId.value = job.id; activeJobStatus.value = job.status; activeJobProgress.value = job.progressPercent; activeJobTotal.value = job.totalItems; activeJobProcessed.value = job.processedItems; activeJobResult.value = job.resultJson;
    scheduleJobPoll();
  } catch (error) {
    const axiosLike = error as { response?: { data?: { message?: string } } };
    store.error = axiosLike.response?.data?.message ?? (error instanceof Error ? error.message : 'Unable to submit B4Me analysis job.');
  } finally { jobSubmitting.value = false; }
}
function resultCount(key: string): number { const value = activeJobResult.value?.[key]; return typeof value === 'number' ? value : 0; }
function scheduleJobPoll(): void { if (jobPollTimer !== null) clearTimeout(jobPollTimer); jobPollTimer = setTimeout(() => { void pollActiveJob(); }, 1500); }
async function pollActiveJob(): Promise<void> {
  if (activeJobId.value === null) return;
  try {
    const job = await readB4MeWrEvaluationJob(activeJobId.value);
    activeJobStatus.value = job.status; activeJobProgress.value = job.progressPercent; activeJobTotal.value = job.totalItems; activeJobProcessed.value = job.processedItems; activeJobResult.value = job.resultJson;
    if (job.status === 'completed') { await runSearch(); return; }
    if (job.status === 'failed' || job.status === 'canceled') { store.error = job.errorMessage ?? `B4Me analysis job ${job.status}.`; return; }
    scheduleJobPoll();
  } catch (error) { store.error = error instanceof Error ? error.message : 'Unable to read B4Me analysis job status.'; }
}

async function runSearch(): Promise<void> {
  const selectedId = store.selectedProspectId;
  await store.load({ draftYear: draftYear.value, playerName: null, scoringMode: scoringMode.value, includeMethodology: includeMethodology.value, includeTeamContextPlaceholder: includeTeamContextPlaceholder.value, enableCompetitionDiscount: limitationFiltersEnabled.value, enableInjuryAvailabilityAdjustment: limitationFiltersEnabled.value, enableQbOffenseContextAdjustment: limitationFiltersEnabled.value, enableSampleSizeAdjustment: limitationFiltersEnabled.value, enableArchetypeConfidenceAdjustment: limitationFiltersEnabled.value, enableCoachabilityAdjustment: decisionViewEnabled.value, enableRfaAdjustment: decisionViewEnabled.value, enableRvaAdjustment: decisionViewEnabled.value });
  if (selectedId !== null && store.rows.some((row) => Number(row.prospectId) === selectedId)) store.setSelectedProspectId(selectedId);
}
function onRowClick(event: DataTableRowClickEvent): void { const row = event.data as { prospectId: number }; store.setSelectedProspectId(row.prospectId); }
function openExplanation(prospectId: number | string): void { const normalized = typeof prospectId === 'number' ? prospectId : Number(prospectId); if (!Number.isNaN(normalized)) store.setSelectedProspectId(normalized); scoreDrawerVisible.value = true; }

onBeforeUnmount(() => { if (jobPollTimer !== null) clearTimeout(jobPollTimer); });
onMounted(async () => {
  const initialProspectId = parseRouteProspectId(route.query.prospectId);
  await runSearch();
  if (initialProspectId !== null && store.rows.some((row) => Number(row.prospectId) === initialProspectId)) store.setSelectedProspectId(initialProspectId);
});
</script>

<style scoped>
.page { display:grid; gap:1rem; }
.header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
.b4me-title { margin:0; line-height:1.1; }
.b4m { display:block; background-color:#054dbd; margin:0; }
.b4me { display:block; font-size:10pt; margin-top:2px; }
.research-attribution { max-width:52rem; margin:.55rem 0 0; color:black; font-size:.9rem; line-height:1.45; }
.search-card { width:100%; }
.filters { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1rem; margin-bottom:1rem; }
.field { display:grid; gap:.35rem; min-width:0; }
.prospect-search-field :deep(.p-input-icon-left), .prospect-search-field :deep(.p-inputtext) { width:100%; }
.toolbar-row { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
.toggles { display:flex; flex-wrap:wrap; gap:1rem; align-items:center; }
.toggle { display:flex; align-items:center; gap:.5rem; }
.job-progress { display:grid; gap:.5rem; margin-bottom:1rem; }
.job-progress-header { display:flex; justify-content:space-between; gap:1rem; }
.job-result-details,.job-progress-details { margin-top:.25rem; font-size:.9rem; }
.workspace-grid { display:grid; grid-template-columns:minmax(22rem,32%) minmax(0,1fr); gap:1rem; align-items:start; }
.prospect-card,.detail-card { min-width:0; }
.prospect-card-title { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; }
.prospect-card-title small { color:var(--text-color-secondary); font-weight:400; }
.score-cell { display:flex; flex-direction:column; gap:.1rem; }
.score-cell span { color:var(--text-color-secondary); font-size:.8rem; }
.preflight-content { display:grid; gap:.75rem; }
.preflight-content p { margin:0; line-height:1.5; }
:deep(.prospect-table .p-datatable-wrapper) { border:1px solid var(--surface-border); border-radius:.5rem; }
:deep(.prospect-table .p-datatable-thead > tr > th) { position:sticky; top:0; z-index:2; }
:deep(.prospect-table .p-datatable-tbody > tr) { cursor:pointer; }
@media (max-width:1200px) { .workspace-grid { grid-template-columns:minmax(20rem,38%) minmax(0,1fr); } .filters { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:900px) { .workspace-grid { grid-template-columns:1fr; } .toolbar-row { align-items:flex-start; flex-direction:column; } .prospect-card { order:1; } .detail-card { order:2; } }
@media (max-width:640px) { .filters { grid-template-columns:1fr; } }
</style>
