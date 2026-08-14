<template>
  <Card v-if="row">
    <template #title>{{ row.playerName }}</template>
    <template #subtitle>
      {{ row.positionGroup }} • {{ row.school ?? 'School n/a' }} • Draft {{ row.draftYear ?? 'n/a' }}
    </template>
    <template #content>
      <Accordion :multiple="true" :activeIndex="[0, 1, 2, 3]">
        <AccordionTab header="Observed Metrics">
          <div class="section-header-row">
            <p class="section-description">
              Source-backed measurements reported as facts. No B4Me judgment is applied in this section.
            </p>
            <Button v-if="canEditObservedMetrics" label="Add / Edit Manual Metrics" icon="pi pi-pencil" size="small" @click="$emit('edit-observed-metrics', row.prospectId)" />
          </div>
          <Message v-if="row.observedMetrics.manualObservation" severity="success" :closable="false">
            Manual source: <strong>{{ row.observedMetrics.manualObservation.sourceName }}</strong>
            • entered {{ formatEnteredAt(row.observedMetrics.manualObservation.enteredAt) }}
            <span v-if="row.observedMetrics.manualObservation.sourceUrl"> • source URL recorded</span>
          </Message>
          <div class="meta-line">
            <strong>Source:</strong> {{ row.observedMetrics.sourceProvider ?? 'n/a' }}
            <span v-if="row.observedMetrics.metricSeasonYear !== null">
              • <strong>Season:</strong> {{ row.observedMetrics.metricSeasonYear }}
            </span>
            <span v-if="row.observedMetrics.seasonSelectionPolicy">
              • {{ formatSeasonPolicy(row.observedMetrics.seasonSelectionPolicy) }}
            </span>
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
          <Message v-else severity="info" :closable="false">
            No source-backed observed metrics are available for this evaluation.
          </Message>
        </AccordionTab>

        <AccordionTab header="Research Indicators">
          <p class="section-description">
            Published WR research benchmarks applied deterministically to source-backed values. Derived estimates do not count as hits or misses.
          </p>
          <div class="research-summary">
            <strong>{{ row.researchIndicators.thresholdsMet }}</strong> of
            <strong>{{ row.researchIndicators.sourceBackedMetricCount }}</strong> verified thresholds met
            <span v-if="row.researchIndicators.derivedMetricCount > 0">
              • {{ row.researchIndicators.derivedMetricCount }} derived estimate(s) excluded
            </span>
          </div>
          <div class="meta-line">
            <strong>Methodology version:</strong> {{ row.researchIndicators.methodologyVersion }}
            <span v-if="row.researchIndicators.metricSeasonYear !== null">
              • <strong>Season:</strong> {{ row.researchIndicators.metricSeasonYear }}
            </span>
          </div>

          <div class="indicator-grid">
            <div class="indicator-row indicator-header">
              <span>Metric</span><span>Actual</span><span>Benchmark</span><span>Result</span>
            </div>
            <div
              v-for="indicator in row.researchIndicators.items"
              :key="indicator.key"
              class="indicator-row"
            >
              <span class="metric-label">{{ indicator.label }}</span>
              <span>{{ formatMetricValue(indicator.value, indicator.key) }}</span>
              <span>{{ indicator.comparison }} {{ formatMetricValue(indicator.threshold, indicator.key) }}</span>
              <Tag :severity="indicatorSeverity(indicator.status)" :value="formatIndicatorStatus(indicator.status)" />
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="Derived Metrics">
          <p class="section-description">{{ row.derivedMetrics.note }}</p>
          <div v-if="row.derivedMetrics.items.length > 0" class="metric-grid">
            <div v-for="metric in row.derivedMetrics.items" :key="metric.key" class="metric-row">
              <span class="metric-label">{{ metric.label }}</span>
              <strong>{{ formatDisplayMetric(metric) }}</strong>
            </div>
          </div>
          <Message v-else severity="info" :closable="false">
            No derived metrics are present for this evaluation.
          </Message>
        </AccordionTab>

        <AccordionTab header="Evaluative Judgment">
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

          <Button
            label="Show Full Evaluation Explanation"
            icon="pi pi-info-circle"
            @click="$emit('show-explanation', row.prospectId)"
          />
        </AccordionTab>
      </Accordion>
    </template>
  </Card>

  <Message v-else severity="warn" :closable="false">
    Select a prospect to view detail.
  </Message>
</template>

<script setup lang="ts">
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import type {
  B4MeEvaluationRow,
  B4MeMetricDisplayItem
} from '../types/b4meAnalysis';

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
}>();

defineEmits<{
  (event: 'show-explanation', prospectId: number): void;
  (event: 'edit-observed-metrics', prospectId: number): void;
}>();
</script>

<style scoped>
.section-description,
.meta-line,
.research-summary {
  margin: 0 0 0.75rem;
}

.section-description {
  color: var(--text-color-secondary);
}

.section-header-row { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 0.75rem; }
.section-header-row .section-description { margin-bottom: 0; }

.metric-grid,
.indicator-grid {
  display: grid;
  gap: 0.4rem;
}

.metric-row {
  display: grid;
  grid-template-columns: minmax(14rem, 1fr) auto;
  gap: 1rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.metric-label {
  font-weight: 600;
}

.indicator-row {
  display: grid;
  grid-template-columns: minmax(12rem, 1.7fr) 0.8fr 1fr 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.4rem 0;
}

.indicator-header {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  border-bottom: 1px solid var(--surface-border);
}

.judgment-note {
  margin-bottom: 1rem;
}

.judgment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.judgment-card {
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  padding: 0.9rem;
}

.judgment-card h4 {
  margin: 0 0 0.65rem;
}

.judgment-card p {
  margin-bottom: 0;
  color: var(--text-color-secondary);
}

.final-assessment {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .judgment-grid {
    grid-template-columns: 1fr;
  }

  .final-assessment {
    grid-column: auto;
  }

  .indicator-row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    border-bottom: 1px solid var(--surface-border);
  }

  .indicator-header {
    display: none;
  }
}
</style>
