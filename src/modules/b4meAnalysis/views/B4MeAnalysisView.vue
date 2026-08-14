<template>
  <div class="page">
    <div class="header-row">
      <div>
        <h1 class="b4me-title">
          <span class="b4m">B4Me Analysis</span>
          <span class="b4me">(Jet-X) Big 4 Metrics Enhanced</span>
        </h1>        
      </div>
      <B4MeVersionBadge :framework-version="store.methodology?.frameworkVersion ?? null" />
    </div>

    <Card class="search-card">
      <template #content>
        <div class="filters">
          <div class="field">
            <label for="positionGroup">Position Group</label>
            <Dropdown
              id="positionGroup"
              v-model="positionGroup"
              :options="positionOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div class="field">
            <label for="draftYear">Draft Year</label>
            <InputNumber
              id="draftYear"
              v-model="draftYear"
              :useGrouping="false"
            />
          </div>

          <div class="field">
            <label for="playerName">Player Name</label>
            <InputText id="playerName" v-model="playerName" />
          </div>

          <div class="field">
            <label for="scoringMode">Scoring Mode</label>
            <Dropdown
              id="scoringMode"
              v-model="scoringMode"
              :options="scoringModeOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>
        </div>

        <div class="toggles">
          <div class="toggle">
            <Checkbox v-model="limitationFiltersEnabled" binary inputId="limitations" />
            <label for="limitations">Limitation Filters</label>
          </div>

          <div class="toggle">
            <Checkbox v-model="decisionViewEnabled" binary inputId="decisionView" />
            <label for="decisionView">Decision View</label>
          </div>

          <div class="toggle">
            <Checkbox v-model="includeMethodology" binary inputId="methodology" />
            <label for="methodology">Include Methodology</label>
          </div>

          <div class="toggle">
            <Checkbox
              v-model="includeTeamContextPlaceholder"
              binary
              inputId="teamContext"
            />
            <label for="teamContext">Include Team Context Placeholder</label>
          </div>

          <Button label="Run Analysis" icon="pi pi-play" :disabled="jobSubmitting || jobRunning || !canEditObservedMetrics || positionGroup !== 'WR'" @click="runAnalysisJob" />
        </div>

        <div v-if="activeJobId !== null" class="job-progress">
          <div class="job-progress-header">
            <strong>B4Me WR Analysis — {{ draftYear }}</strong>
            <span>Status: {{ activeJobStatus.toUpperCase() }}</span>
          </div>
          <ProgressBar :value="activeJobProgress" />
          <div class="job-progress-details">
            {{ activeJobProcessed }} / {{ activeJobTotal }} processed · {{ activeJobProgress }}%
          </div>
          <div v-if="activeJobStatus === 'completed' && activeJobResult !== null" class="job-result-details">
            Evaluated: {{ resultCount('evaluated') }} · Reused: {{ resultCount('reused') }} ·
            Identity review: {{ resultCount('identityReviewRequired') }} · Duplicate review: {{ resultCount('duplicateReviewRequired') }} ·
            Provider unavailable: {{ resultCount('providerUnavailable') }} · Timeouts: {{ resultCount('providerTimeout') }} · Failed: {{ resultCount('failed') }}
          </div>
        </div>

        <ActiveFilterSummaryBadges :summary="store.activeFilterSummary" />
      </template>
    </Card>

    <Message v-if="store.error" severity="error" :closable="false">
      {{ store.error }}
    </Message>

    <ProgressSpinner v-if="store.loading" />

    <Message
      v-else-if="!store.loading && store.rows.length === 0"
      severity="info"
      :closable="false"
    >
      No prospects matched the current filters.
    </Message>

    <div v-else class="content-grid">
      <Card>
        <template #title>Prospects</template>
        <template #content>
          <DataTable
            :value="store.rows"
            dataKey="prospectId"
            selectionMode="single"
            :selection="store.selectedRow"
            @row-click="onRowClick"
          >
            <Column field="playerName" header="Player" />
            <Column field="positionGroup" header="Group" />
            <Column header="Research Hits">
              <template #body="slotProps">
                {{ slotProps.data.researchIndicators.thresholdsMet }}/{{ slotProps.data.researchIndicators.sourceBackedMetricCount }}
              </template>
            </Column>
            <Column header="B4Me Evaluation">
              <template #body="slotProps">
                {{ slotProps.data.evaluativeJudgment.finalB4MeAssessment.label }}
                ({{ slotProps.data.evaluativeJudgment.finalB4MeAssessment.score }})
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <div class="side-stack">
        <B4MeProspectDetailPanel
          :row="store.selectedRow"
          :can-edit-observed-metrics="canEditObservedMetrics"
          @show-explanation="openExplanation"
          @edit-observed-metrics="openManualMetrics"
        />
        <MethodologyPanel :methodology="store.methodology" />
        <LimitationsPanel :methodology="store.methodology" />
        <TeamContextPlaceholderPanel :team-context="store.optionalTeamContext" />
      </div>
    </div>

    <ManualWrObservedMetricsDialog
      v-model:visible="manualMetricsVisible"
      :row="store.selectedRow"
      :saving="manualMetricsSaving"
      :error="manualMetricsError"
      @save="saveManualMetrics"
    />

    <ScoreExplanationDrawer
      v-model:visible="scoreDrawerVisible"
      :explanation="activeExplanation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import ProgressBar from 'primevue/progressbar';
import { useB4MeAnalysisStore } from '../stores/useB4MeAnalysisStore';
import { can } from '@/modules/accessControl/application/can';
import { enqueueB4MeWrEvaluation, readB4MeWrEvaluationJob, saveManualWrObservedMetrics } from '../services/b4meAnalysis.service';
import type {
  B4MePositionGroup,
  B4MeScoringMode,
  B4MeScoreExplanation,
  ManualWrObservedMetricsRequest
} from '../types/b4meAnalysis';
import ActiveFilterSummaryBadges from '../components/ActiveFilterSummaryBadges.vue';
import B4MeProspectDetailPanel from '../components/B4MeProspectDetailPanel.vue';
import ManualWrObservedMetricsDialog from '../components/ManualWrObservedMetricsDialog.vue';
import B4MeVersionBadge from '../components/B4MeVersionBadge.vue';
import LimitationsPanel from '../components/LimitationsPanel.vue';
import MethodologyPanel from '../components/MethodologyPanel.vue';
import ScoreExplanationDrawer from '../components/ScoreExplanationDrawer.vue';
import TeamContextPlaceholderPanel from '../components/TeamContextPlaceholderPanel.vue';

type RouteBooleanDefault = boolean;

function parseRouteBoolean(
  value: unknown,
  defaultValue: RouteBooleanDefault
): boolean {
  if (typeof value !== 'string') {
    return defaultValue;
  }

  const normalized: string = value.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1') {
    return true;
  }

  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  return defaultValue;
}

function parseRouteNullableNumber(value: unknown, defaultValue: number | null): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return defaultValue;
  }

  const parsed: number = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function parseRouteScoringMode(value: unknown): B4MeScoringMode {
  if (
    value === 'BASE_ONLY' ||
    value === 'BASE_PLUS_CONTEXT' ||
    value === 'FULL_DECISION_SCORE'
  ) {
    return value;
  }

  return 'BASE_PLUS_CONTEXT';
}

function parseRouteProspectId(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed: number = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const route = useRoute();
const store = useB4MeAnalysisStore();
const canEditObservedMetrics = computed<boolean>(() => can('SCOUTING', 'EDIT'));
const manualMetricsVisible = ref<boolean>(false);
const manualMetricsSaving = ref<boolean>(false);
const manualMetricsError = ref<string | null>(null);
const jobSubmitting = ref<boolean>(false);
const activeJobId = ref<number | null>(null);
const activeJobStatus = ref<string>('idle');
const activeJobProgress = ref<number>(0);
const activeJobTotal = ref<number>(0);
const activeJobProcessed = ref<number>(0);
const activeJobResult = ref<Record<string, unknown> | null>(null);
const jobRunning = computed<boolean>(() => activeJobStatus.value === 'pending' || activeJobStatus.value === 'in_progress');
let jobPollTimer: ReturnType<typeof setTimeout> | null = null;

function openManualMetrics(): void {
  manualMetricsError.value = null;
  manualMetricsVisible.value = true;
}

async function saveManualMetrics(request: ManualWrObservedMetricsRequest): Promise<void> {
  if (store.selectedRow === null) return;
  manualMetricsSaving.value = true;
  manualMetricsError.value = null;
  try {
    await saveManualWrObservedMetrics(store.selectedRow.prospectId, request);
    manualMetricsVisible.value = false;
    await runSearch();
    store.setSelectedProspectId(store.selectedRow?.prospectId ?? null);
  } catch (error) {
    const axiosLike = error as { response?: { data?: { message?: string } } };
    manualMetricsError.value = axiosLike.response?.data?.message ?? (error instanceof Error ? error.message : 'Unable to save manual WR metrics.');
  } finally {
    manualMetricsSaving.value = false;
  }
}


const positionOptions: Array<{ label: string; value: B4MePositionGroup }> = [
  { label: 'Wide Receiver', value: 'WR' },
  { label: 'Edge Defender', value: 'ED' },
  { label: 'Offensive Tackle', value: 'OT' },
  { label: 'Defensive Tackle', value: 'DT' },
  { label: 'Cornerback', value: 'CB' }
];

const scoringModeOptions: Array<{ label: string; value: B4MeScoringMode }> = [
  { label: 'Base Only', value: 'BASE_ONLY' },
  { label: 'Base Plus Context', value: 'BASE_PLUS_CONTEXT' },
  { label: 'Full Decision Score', value: 'FULL_DECISION_SCORE' }
];

/**
 * Backend is currently WR-only, but keep the UI field for forward compatibility.
 * It should not alter the current API request until other groups are implemented server-side.
 */
const positionGroup = ref<B4MePositionGroup>(
  (route.query.positionGroup as B4MePositionGroup) || 'WR'
);

const draftYear = ref<number | null>(
  parseRouteNullableNumber(route.query.draftYear, new Date().getFullYear())
);

const playerName = ref<string>(
  typeof route.query.playerName === 'string' ? route.query.playerName : ''
);

const scoringMode = ref<B4MeScoringMode>(
  parseRouteScoringMode(route.query.scoringMode)
);

const limitationFiltersEnabled = ref<boolean>(
  parseRouteBoolean(route.query.limitationFiltersEnabled, true)
);

const decisionViewEnabled = ref<boolean>(
  parseRouteBoolean(route.query.decisionViewEnabled, true)
);

const includeMethodology = ref<boolean>(
  parseRouteBoolean(route.query.includeMethodology, true)
);

const includeTeamContextPlaceholder = ref<boolean>(
  parseRouteBoolean(route.query.includeTeamContextPlaceholder, true)
);

const scoreDrawerVisible = ref<boolean>(false);

const activeExplanation = computed<B4MeScoreExplanation | null>(() => {
  const row = store.selectedRow;
  if (!row) return null;

  return {
    title: `${row.playerName} B4Me evaluation`,
    summary: row.evaluativeJudgment.finalB4MeAssessment.explanation,
    lines: row.evaluativeJudgment.finalB4MeAssessment.projectionNote
      ? [row.evaluativeJudgment.finalB4MeAssessment.projectionNote]
      : []
  };
});

async function runAnalysisJob(): Promise<void> {
  if (draftYear.value === null || positionGroup.value !== 'WR') return;
  jobSubmitting.value = true;
  try {
    const job = await enqueueB4MeWrEvaluation({
      draftYear: draftYear.value,
      positionGroup: 'WR',
      refreshPolicy: 'MISSING_OR_STALE',
      scoringMode: scoringMode.value
    });
    activeJobId.value = job.id;
    activeJobStatus.value = job.status;
    activeJobProgress.value = job.progressPercent;
    activeJobTotal.value = job.totalItems;
    activeJobProcessed.value = job.processedItems;
    activeJobResult.value = job.resultJson;
    scheduleJobPoll();
  } catch (error) {
    const axiosLike = error as { response?: { data?: { message?: string } } };
    store.error = axiosLike.response?.data?.message ?? (error instanceof Error ? error.message : 'Unable to submit B4Me analysis job.');
  } finally {
    jobSubmitting.value = false;
  }
}


function resultCount(key: string): number {
  const value = activeJobResult.value?.[key];
  return typeof value === 'number' ? value : 0;
}

function scheduleJobPoll(): void {
  if (jobPollTimer !== null) clearTimeout(jobPollTimer);
  jobPollTimer = setTimeout(() => { void pollActiveJob(); }, 1500);
}

async function pollActiveJob(): Promise<void> {
  if (activeJobId.value === null) return;
  try {
    const job = await readB4MeWrEvaluationJob(activeJobId.value);
    activeJobStatus.value = job.status;
    activeJobProgress.value = job.progressPercent;
    activeJobTotal.value = job.totalItems;
    activeJobProcessed.value = job.processedItems;
    activeJobResult.value = job.resultJson;
    if (job.status === 'completed') {
      await runSearch();
      return;
    }
    if (job.status === 'failed' || job.status === 'canceled') {
      store.error = job.errorMessage ?? `B4Me analysis job ${job.status}.`;
      return;
    }
    scheduleJobPoll();
  } catch (error) {
    store.error = error instanceof Error ? error.message : 'Unable to read B4Me analysis job status.';
  }
}

async function runSearch(): Promise<void> {
  await store.load({
    draftYear: draftYear.value,
    playerName: playerName.value.trim().length > 0 ? playerName.value.trim() : null,
    scoringMode: scoringMode.value,
    includeMethodology: includeMethodology.value,
    includeTeamContextPlaceholder: includeTeamContextPlaceholder.value,

    /**
     * "Limitation Filters" controls the limitation-correction layer.
     */
    enableCompetitionDiscount: limitationFiltersEnabled.value,
    enableInjuryAvailabilityAdjustment: limitationFiltersEnabled.value,
    enableQbOffenseContextAdjustment: limitationFiltersEnabled.value,
    enableSampleSizeAdjustment: limitationFiltersEnabled.value,
    enableArchetypeConfidenceAdjustment: limitationFiltersEnabled.value,

    /**
     * "Decision View" controls the downstream decision overlays.
     */
    enableCoachabilityAdjustment: decisionViewEnabled.value,
    enableRfaAdjustment: decisionViewEnabled.value,
    enableRvaAdjustment: decisionViewEnabled.value
  });

}

function onRowClick(event: DataTableRowClickEvent): void {
  const row = event.data as { prospectId: number };
  store.setSelectedProspectId(row.prospectId);
}

function openExplanation(prospectId: number | string): void {
  const normalizedProspectId: number =
    typeof prospectId === 'number' ? prospectId : Number(prospectId);

  if (!Number.isNaN(normalizedProspectId)) {
    store.setSelectedProspectId(normalizedProspectId);
  }

  scoreDrawerVisible.value = true;
}

onBeforeUnmount(() => {
  if (jobPollTimer !== null) clearTimeout(jobPollTimer);
});

onMounted(async () => {
  const initialProspectId: number | null = parseRouteProspectId(route.query.prospectId);

  await runSearch();

  if (
    initialProspectId !== null &&
    store.rows.some((row) => Number(row.prospectId) === initialProspectId)
  ) {
    store.setSelectedProspectId(initialProspectId);
  }
});
</script>

<style scoped>
.b4me-title {
  margin: 0;
  line-height: 1.1;
}

.b4m {
  display: block;
  background-color: #054dbd;
  margin: 0;
}

.b4me {
  display: block;
  font-size: 10pt;
  margin-top: 2px;
}
.page {
  display: grid;
  gap: 1rem;
}

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.search-card {
  width: 100%;
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.job-progress {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.job-progress-header,
.job-result-details {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.job-progress-details {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 1rem;
}

.side-stack {
  display: grid;
  gap: 1rem;
}
</style>