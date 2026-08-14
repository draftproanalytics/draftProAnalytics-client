<template>
  <div v-if="row" class="detail-shell">
    <div class="prospect-header">
      <div>
        <h2>{{ row.playerName }}</h2>
        <div class="prospect-subtitle">
          {{ row.positionGroup }} · {{ row.school ?? 'School n/a' }} · Draft {{ row.draftYear ?? 'n/a' }}
        </div>
      </div>
      <div class="header-status">
        <Tag :value="row.evaluativeJudgment.finalB4MeAssessment.label" severity="info" />
        <strong>{{ row.evaluativeJudgment.finalB4MeAssessment.score }}</strong>
      </div>
    </div>

    <TabView v-model:activeIndex="activeTabIndex" class="analysis-tabs">
      <TabPanel header="Overview">
        <div class="overview-grid">
          <div class="summary-card featured">
            <span class="summary-label">B4Me Assessment</span>
            <strong class="summary-value">{{ row.evaluativeJudgment.finalB4MeAssessment.score }}</strong>
            <span>{{ row.evaluativeJudgment.finalB4MeAssessment.label }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Research Indicators</span>
            <strong class="summary-value">{{ row.researchIndicators.thresholdsMet }}/{{ row.researchIndicators.sourceBackedMetricCount }}</strong>
            <span>verified thresholds met</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Observed Data</span>
            <strong class="summary-value">{{ row.observedMetrics.items.length }}</strong>
            <span>source-backed metric(s)</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Metric Season</span>
            <strong class="summary-value compact">{{ row.observedMetrics.metricSeasonYear ?? 'n/a' }}</strong>
            <span>{{ row.observedMetrics.seasonSelectionPolicy ? formatSeasonPolicy(row.observedMetrics.seasonSelectionPolicy) : 'season policy unavailable' }}</span>
          </div>
        </div>

        <div class="overview-judgment-grid">
          <div class="judgment-card">
            <h4>Coachability</h4>
            <div><strong>Tier:</strong> {{ row.evaluativeJudgment.coachability.tier ?? 'n/a' }}</div>
            <div><strong>Adjustment:</strong> {{ formatSigned(row.evaluativeJudgment.coachability.adjustment) }}</div>
          </div>
          <div class="judgment-card">
            <h4>RFA</h4>
            <div><strong>Tier:</strong> {{ row.evaluativeJudgment.rfa.tier ?? 'n/a' }}</div>
            <div><strong>Adjustment:</strong> {{ formatSigned(row.evaluativeJudgment.rfa.adjustment) }}</div>
          </div>
          <div class="judgment-card">
            <h4>RVA</h4>
            <div><strong>Tier:</strong> {{ row.evaluativeJudgment.rva.tier ?? 'n/a' }}</div>
            <div><strong>Score:</strong> {{ row.evaluativeJudgment.rva.score ?? 'n/a' }}</div>
          </div>
        </div>

        <Message severity="info" :closable="false">
          {{ row.evaluativeJudgment.finalB4MeAssessment.projectionNote ?? row.evaluativeJudgment.finalB4MeAssessment.explanation }}
        </Message>
      </TabPanel>

      <TabPanel header="Observed Metrics">
        <div class="section-header-row">
          <p class="section-description">
            Source-backed measurements reported as facts. No B4Me judgment is applied in this section.
          </p>
          <Button v-if="canEditObservedMetrics" label="Add / Edit Manual Metrics" icon="pi pi-pencil" size="small" @click="$emit('edit-observed-metrics', row.prospectId)" />
        </div>
        <Message v-if="row.observedMetrics.manualObservation" severity="success" :closable="false">
          Manual source: <strong>{{ row.observedMetrics.manualObservation.sourceName }}</strong>
          · entered {{ formatEnteredAt(row.observedMetrics.manualObservation.enteredAt) }}
          <span v-if="row.observedMetrics.manualObservation.sourceUrl"> · source URL recorded</span>
        </Message>
        <div class="meta-line">
          <strong>Source:</strong> {{ row.observedMetrics.sourceProvider ?? 'n/a' }}
          <span v-if="row.observedMetrics.metricSeasonYear !== null"> · <strong>Season:</strong> {{ row.observedMetrics.metricSeasonYear }}</span>
          <span v-if="row.observedMetrics.seasonSelectionPolicy"> · {{ formatSeasonPolicy(row.observedMetrics.seasonSelectionPolicy) }}</span>
        </div>
        <div v-if="row.observedMetrics.sourcesUsed.length > 0" class="meta-line">
          <strong>Sources used:</strong> {{ row.observedMetrics.sourcesUsed.join(', ') }}
        </div>
        <div v-if="row.observedMetrics.items.length > 0" class="metric-grid">
          <div v-for="metric in row.observedMetrics.items" :key="metric.key" class="metric-row">
            <span class="metric-label">{{ metric.label }}</span>
            <strong>{{ formatDisplayMetric(metric) }}</strong>
          </div>
        </div>
        <Message v-else severity="info" :closable="false">No source-backed observed metrics are available for this evaluation.</Message>
      </TabPanel>

      <TabPanel header="Research">
        <p class="section-description">
          Published WR research benchmarks applied deterministically to source-backed values. Derived estimates do not count as hits or misses.
        </p>
        <div class="research-summary">
          <strong>{{ row.researchIndicators.thresholdsMet }}</strong> of
          <strong>{{ row.researchIndicators.sourceBackedMetricCount }}</strong> verified thresholds met
          <span v-if="row.researchIndicators.derivedMetricCount > 0"> · {{ row.researchIndicators.derivedMetricCount }} derived estimate(s) excluded</span>
        </div>
        <div class="meta-line">
          <strong>Methodology version:</strong> {{ row.researchIndicators.methodologyVersion }}
          <span v-if="row.researchIndicators.metricSeasonYear !== null"> · <strong>Season:</strong> {{ row.researchIndicators.metricSeasonYear }}</span>
        </div>
        <div class="indicator-grid">
          <div class="indicator-row indicator-header">
            <span>Metric</span><span>Actual</span><span>Benchmark</span><span>Result</span>
          </div>
          <div v-for="indicator in row.researchIndicators.items" :key="indicator.key" class="indicator-row">
            <span class="metric-label">{{ indicator.label }}</span>
            <span>{{ formatMetricValue(indicator.value, indicator.key) }}</span>
            <span>{{ indicator.comparison }} {{ formatMetricValue(indicator.threshold, indicator.key) }}</span>
            <Tag :severity="indicatorSeverity(indicator.status)" :value="formatIndicatorStatus(indicator.status)" />
          </div>
        </div>
      </TabPanel>

      <TabPanel header="Derived">
        <p class="section-description">{{ row.derivedMetrics.note }}</p>
        <Message severity="info" :closable="false" class="derived-note">
          These values are calculated or inferred from available observations and should not be presented as source-backed facts.
        </Message>
        <div v-if="row.derivedMetrics.items.length > 0" class="metric-grid">
          <div v-for="metric in row.derivedMetrics.items" :key="metric.key" class="metric-row">
            <span class="metric-label">{{ metric.label }}</span>
            <strong>{{ formatDisplayMetric(metric) }}</strong>
          </div>
        </div>
        <Message v-else severity="info" :closable="false">No derived metrics are present for this evaluation.</Message>
      </TabPanel>

      <TabPanel header="Evaluation">
        <Message severity="warn" :closable="false" class="judgment-note">
          These values are model evaluations, not observed facts. They should be interpreted as decision support.
        </Message>
        <div class="judgment-grid">
          <div class="judgment-card">
            <h4>Coachability</h4>
            <div><strong>Tier:</strong> {{ row.evaluativeJudgment.coachability.tier ?? 'n/a' }}</div>
            <div><strong>Adjustment:</strong> {{ formatSigned(row.evaluativeJudgment.coachability.adjustment) }}</div>
            <div><strong>Press survivability:</strong> {{ row.evaluativeJudgment.coachability.pressManSurvivability ?? 'n/a' }}</div>
            <p>{{ row.evaluativeJudgment.coachability.summary ?? 'No coachability summary.' }}</p>
          </div>
          <div class="judgment-card">
            <h4>RFA</h4>
            <div><strong>Tier:</strong> {{ row.evaluativeJudgment.rfa.tier ?? 'n/a' }}</div>
            <div><strong>Adjustment:</strong> {{ formatSigned(row.evaluativeJudgment.rfa.adjustment) }}</div>
            <p>{{ row.evaluativeJudgment.rfa.summary ?? 'No RFA summary.' }}</p>
          </div>
          <div class="judgment-card">
            <h4>RVA</h4>
            <div><strong>Tier:</strong> {{ row.evaluativeJudgment.rva.tier ?? 'n/a' }}</div>
            <div><strong>Score:</strong> {{ row.evaluativeJudgment.rva.score ?? 'n/a' }}</div>
          </div>
          <div class="judgment-card final-assessment">
            <h4>Final B4Me Assessment</h4>
            <div><strong>Score:</strong> {{ row.evaluativeJudgment.finalB4MeAssessment.score }}</div>
            <div><strong>Label:</strong> {{ row.evaluativeJudgment.finalB4MeAssessment.label }}</div>
            <p>{{ row.evaluativeJudgment.finalB4MeAssessment.projectionNote ?? row.evaluativeJudgment.finalB4MeAssessment.explanation }}</p>
          </div>
        </div>
        <Button label="Show Full Evaluation Explanation" icon="pi pi-info-circle" @click="$emit('show-explanation', row.prospectId)" />
      </TabPanel>

      <TabPanel header="Methodology">
        <div class="research-foundation">
          <h3>Research Foundation</h3>
          <p>
            B4Me (<strong>Big 4 Metrics Enhanced</strong>) is inspired by and builds upon Michael Nania’s
            published Big 4 Metrics approach to wide receiver evaluation. Nania’s work identifies four
            key areas used in evaluating wide receiver prospects; DraftProAnalytics does not claim
            authorship of those underlying Big 4 Metrics concepts.
          </p>
          <p>
            B4Me extends that research foundation into a software-based evaluation framework that adds
            source-backed observations, deterministic research indicators, derived metrics, contextual
            evaluation, data provenance, limitation tracking, and reproducible evaluation results.
          </p>
          <Message severity="info" :closable="false">
            B4Me and DraftProAnalytics are independent projects and are not affiliated with, sponsored by,
            or endorsed by Michael Nania or Jets X-Factor.
          </Message>
        </div>

        <div v-if="methodology" class="methodology-content">
          <div class="framework-grid">
            <div><span>Version</span><strong>{{ methodology.frameworkVersion }}</strong></div>
            <div><span>Framework Type</span><strong>{{ methodology.positionGroupFrameworkType }}</strong></div>
            <div><span>Lineage</span><strong>{{ methodology.methodologyLineage }}</strong></div>
            <div><span>Validation</span><strong>{{ methodology.validationStatus }}</strong></div>
            <div><span>Scoring Mode</span><strong>{{ methodology.scoringModeUsed }}</strong></div>
          </div>
          <Message v-if="methodology.validationNote" severity="info" :closable="false">{{ methodology.validationNote }}</Message>
          <div v-for="section in methodology.methodologySections ?? []" :key="section.key" class="methodology-section">
            <h4>{{ section.title }}</h4>
            <p>{{ section.body }}</p>
          </div>
          <div class="methodology-section">
            <h4>Known Limitations</h4>
            <ul v-if="methodology.knownLimitations?.length" class="limitation-list">
              <li v-for="item in methodology.knownLimitations" :key="item">{{ item }}</li>
            </ul>
            <p v-else>No limitations were returned.</p>
          </div>
        </div>
        <Message v-else severity="info" :closable="false">Methodology was not included in this response.</Message>
      </TabPanel>

      <TabPanel header="Team Context">
        <div v-if="teamContext" class="team-context-grid">
          <div><span>Coaching Grade by Group</span><strong>{{ teamContext.teamCoachingGradeByGroup ?? 'Deferred' }}</strong></div>
          <div><span>Development Environment</span><strong>{{ teamContext.teamDevelopmentEnvironment ?? 'Deferred' }}</strong></div>
          <div><span>Usage Context</span><strong>{{ teamContext.teamUsageFitContext ?? 'Deferred' }}</strong></div>
          <div><span>Applied to B4Me</span><strong>{{ teamContext.isApplied ? 'Yes' : 'No' }}</strong></div>
          <Message severity="info" :closable="false" class="team-context-message">
            {{ teamContext.label }}. Team context remains a separate decision-support layer and does not mutate the canonical B4Me framework by default.
          </Message>
        </div>
        <Message v-else severity="info" :closable="false">Team context was not included in this response.</Message>
      </TabPanel>
    </TabView>
  </div>

  <div v-else class="empty-detail">
    <i class="pi pi-user"></i>
    <h3>No prospect selected</h3>
    <p>Select a prospect from the list to view its B4Me analysis.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import type {
  B4MeEvaluationRow,
  B4MeMethodologyMetadata,
  B4MeMetricDisplayItem,
  B4MeOptionalTeamContext
} from '../types/b4meAnalysis';

const activeTabIndex = ref<number>(0);

function formatEnteredAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatIndicatorStatus(status: string): string {
  return status.replaceAll('_', ' ');
}

function indicatorSeverity(status: string): 'success' | 'danger' | 'warning' | 'info' | undefined {
  if (status === 'HIT') return 'success';
  if (status === 'MISS') return 'danger';
  if (status === 'DERIVED_ESTIMATE') return 'warning';
  return 'info';
}

function formatSeasonPolicy(policy: string): string {
  return policy.replaceAll('_', ' ').toLowerCase();
}

function formatMetricValue(value: number | null, key: string): string {
  if (value === null) return 'n/a';
  if (key === 'CCR' || key === 'BLOS_RATE') return `${value.toFixed(1)}%`;
  return key === 'YPRR' ? value.toFixed(2) : value.toFixed(1);
}

function formatDisplayMetric(metric: B4MeMetricDisplayItem): string {
  if (metric.value === null) return 'n/a';
  if (metric.key === 'pressManWinRate' && typeof metric.value === 'number') {
    return `${(metric.value * 100).toFixed(1)}%`;
  }
  const formatted = typeof metric.value === 'number'
    ? Number.isInteger(metric.value) ? String(metric.value) : metric.value.toFixed(2)
    : metric.value;
  return metric.unit === '%' ? `${formatted}%` : metric.unit ? `${formatted} ${metric.unit}` : formatted;
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

defineProps<{
  row: B4MeEvaluationRow | null;
  canEditObservedMetrics: boolean;
  methodology: B4MeMethodologyMetadata | null;
  teamContext: B4MeOptionalTeamContext | null;
}>();

defineEmits<{
  (event: 'show-explanation', prospectId: number): void;
  (event: 'edit-observed-metrics', prospectId: number): void;
}>();
</script>

<style scoped>
.detail-shell { min-width: 0; }
.prospect-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.25rem .25rem 1rem; border-bottom:1px solid var(--surface-border); }
.prospect-header h2 { margin:0; }
.prospect-subtitle { margin-top:.25rem; color:var(--text-color-secondary); }
.header-status { display:flex; align-items:center; gap:.75rem; }
.header-status strong { font-size:1.35rem; }
.analysis-tabs { margin-top:.5rem; }
.overview-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.75rem; margin-bottom:1rem; }
.summary-card { border:1px solid var(--surface-border); border-radius:.6rem; padding:1rem; display:flex; flex-direction:column; gap:.3rem; min-width:0; }
.summary-card.featured { border-color:var(--primary-color); }
.summary-label { color:var(--text-color-secondary); font-size:.85rem; }
.summary-value { font-size:1.65rem; line-height:1; }
.summary-value.compact { font-size:1.25rem; }
.overview-judgment-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.75rem; margin-bottom:1rem; }
.section-description,.meta-line,.research-summary { margin:0 0 .75rem; }
.section-description { color:var(--text-color-secondary); }
.section-header-row { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:.75rem; }
.section-header-row .section-description { margin-bottom:0; }
.metric-grid,.indicator-grid { display:grid; gap:.4rem; }
.metric-row { display:grid; grid-template-columns:minmax(14rem,1fr) auto; gap:1rem; padding:.5rem 0; border-bottom:1px solid var(--surface-border); }
.metric-label { font-weight:600; }
.indicator-row { display:grid; grid-template-columns:minmax(12rem,1.7fr) .8fr 1fr 1fr; gap:.75rem; align-items:center; padding:.5rem 0; }
.indicator-header { font-size:.85rem; color:var(--text-color-secondary); border-bottom:1px solid var(--surface-border); }
.derived-note,.judgment-note { margin-bottom:1rem; }
.judgment-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-bottom:1rem; }
.judgment-card { border:1px solid var(--surface-border); border-radius:.5rem; padding:.9rem; }
.judgment-card h4 { margin:0 0 .65rem; }
.judgment-card p { margin-bottom:0; color:var(--text-color-secondary); }
.final-assessment { grid-column:1 / -1; }
.framework-grid,.team-context-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem; margin-bottom:1rem; }
.framework-grid > div,.team-context-grid > div { border:1px solid var(--surface-border); border-radius:.5rem; padding:.85rem; display:flex; flex-direction:column; gap:.25rem; }
.framework-grid span,.team-context-grid span { color:var(--text-color-secondary); font-size:.85rem; }
.research-foundation { margin-bottom:1.25rem; padding-bottom:1rem; border-bottom:1px solid var(--surface-border); }
.research-foundation h3 { margin:.25rem 0 .65rem; }
.research-foundation p { margin:.45rem 0; line-height:1.55; }
.methodology-section { padding-top:.75rem; }
.methodology-section h4 { margin:.25rem 0 .5rem; }
.methodology-section p { margin-top:0; }
.limitation-list { margin:0; padding-left:1.25rem; }
.team-context-message { grid-column:1 / -1; }
.empty-detail { min-height:28rem; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--text-color-secondary); border:1px dashed var(--surface-border); border-radius:.6rem; padding:2rem; }
.empty-detail i { font-size:2rem; margin-bottom:.75rem; }
.empty-detail h3 { margin:.25rem 0; color:var(--text-color); }
.empty-detail p { margin:.25rem 0 0; }
@media (max-width:1200px) { .overview-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:900px) { .overview-judgment-grid,.judgment-grid,.framework-grid,.team-context-grid { grid-template-columns:1fr; } .final-assessment,.team-context-message { grid-column:auto; } .indicator-row { grid-template-columns:1fr; gap:.2rem; border-bottom:1px solid var(--surface-border); } .indicator-header { display:none; } }
</style>
