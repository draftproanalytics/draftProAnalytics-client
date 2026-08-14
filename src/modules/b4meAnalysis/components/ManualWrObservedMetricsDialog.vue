<template>
  <Dialog v-model:visible="visibleModel" modal header="Manual WR Observed Metrics" :style="{ width: '42rem' }">
    <Message severity="info" :closable="false">
      These values are stored as source-backed manual observations. Saving them invalidates prior B4Me snapshots for this prospect and recalculates research indicators on the next analysis load.
    </Message>

    <div class="form-grid">
      <div class="field"><label for="manual-yprr">Yards Per Route Run (YPRR)</label><InputNumber id="manual-yprr" v-model="form.yprr" :min="0" :max="10" :minFractionDigits="2" :maxFractionDigits="3" /></div>
      <div class="field"><label for="manual-pff">PFF Overall Grade</label><InputNumber id="manual-pff" v-model="form.pffOverallGrade" :min="0" :max="100" :minFractionDigits="1" :maxFractionDigits="2" /></div>
      <div class="field"><label for="manual-ccr">Contested Catch Rate (%)</label><InputNumber id="manual-ccr" v-model="form.contestedCatchRate" :min="0" :max="100" :minFractionDigits="1" :maxFractionDigits="2" /></div>
      <div class="field"><label for="manual-blos">Behind-LOS Target Rate (%)</label><InputNumber id="manual-blos" v-model="form.behindLosTargetRate" :min="0" :max="100" :minFractionDigits="1" :maxFractionDigits="2" /></div>
      <div class="field"><label for="manual-season">Metric Season</label><InputNumber id="manual-season" v-model="form.metricSeasonYear" :useGrouping="false" :min="2000" :max="2100" /></div>
      <div class="field"><label for="manual-source">Source Name</label><InputText id="manual-source" v-model="form.sourceName" maxlength="200" /></div>
      <div class="field full"><label for="manual-url">Source URL (optional)</label><InputText id="manual-url" v-model="form.sourceUrl" maxlength="1000" /></div>
      <div class="field full"><label for="manual-notes">Notes (optional)</label><Textarea id="manual-notes" v-model="form.notes" rows="3" maxlength="2000" autoResize /></div>
    </div>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="visibleModel = false" />
      <Button label="Save Observed Metrics" icon="pi pi-save" :loading="saving" :disabled="!valid" @click="save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import type { B4MeEvaluationRow, ManualWrObservedMetricsRequest } from '../types/b4meAnalysis';

const props = defineProps<{ visible: boolean; row: B4MeEvaluationRow | null; saving: boolean; error: string | null }>();
const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
  (event: 'save', value: ManualWrObservedMetricsRequest): void;
}>();
const visibleModel = computed({ get: () => props.visible, set: (value: boolean) => emit('update:visible', value) });
const form = reactive({ yprr: null as number | null, pffOverallGrade: null as number | null, contestedCatchRate: null as number | null, behindLosTargetRate: null as number | null, metricSeasonYear: null as number | null, sourceName: '', sourceUrl: '', notes: '' });

function metricValue(key: string): number | null {
  const metric = props.row?.observedMetrics.items.find((item) => item.key === key);
  return typeof metric?.value === 'number' ? metric.value : null;
}
function populate(): void {
  form.yprr = metricValue('yprr'); form.pffOverallGrade = metricValue('pffOverallGrade'); form.contestedCatchRate = metricValue('contestedCatchRate'); form.behindLosTargetRate = metricValue('behindLosTargetRate');
  form.metricSeasonYear = props.row?.observedMetrics.metricSeasonYear ?? ((props.row?.draftYear ?? new Date().getFullYear() + 1) - 1);
  form.sourceName = props.row?.observedMetrics.manualObservation?.sourceName ?? '';
  form.sourceUrl = props.row?.observedMetrics.manualObservation?.sourceUrl ?? '';
  form.notes = props.row?.observedMetrics.manualObservation?.notes ?? '';
}
watch(() => [props.visible, props.row?.prospectId], () => { if (props.visible) populate(); }, { immediate: true });
const valid = computed(() => form.yprr !== null && form.yprr >= 0 && form.yprr <= 10 && form.pffOverallGrade !== null && form.pffOverallGrade >= 0 && form.pffOverallGrade <= 100 && form.contestedCatchRate !== null && form.contestedCatchRate >= 0 && form.contestedCatchRate <= 100 && form.behindLosTargetRate !== null && form.behindLosTargetRate >= 0 && form.behindLosTargetRate <= 100 && form.metricSeasonYear !== null && Number.isInteger(form.metricSeasonYear) && form.sourceName.trim().length > 0);
function save(): void {
  if (!valid.value || form.yprr === null || form.pffOverallGrade === null || form.contestedCatchRate === null || form.behindLosTargetRate === null || form.metricSeasonYear === null) return;
  emit('save', { yprr: form.yprr, pffOverallGrade: form.pffOverallGrade, contestedCatchRate: form.contestedCatchRate, behindLosTargetRate: form.behindLosTargetRate, metricSeasonYear: form.metricSeasonYear, sourceName: form.sourceName.trim(), sourceUrl: form.sourceUrl.trim() || null, notes: form.notes.trim() || null });
}
</script>

<style scoped>
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 1rem 0; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.full { grid-column: 1 / -1; }
@media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } .full { grid-column: auto; } }
</style>
