<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useDpaJobsStore } from '../stores/useDpaJobsStore'

const emit = defineEmits<{ readonly 'job-submitted': [jobId: number] }>()
const jobsStore = useDpaJobsStore()
const currentYear = new Date().getFullYear()
const draftYear = ref(currentYear + 1)
const asOfDate = ref(`${currentYear}-01-31`)
const teamId = ref<number | null>(null)
const replaceRecommendations = ref(true)
const algorithmVersion = ref('team-needs-v4')
const localMessage = ref<string | null>(null)

const canSubmit = computed(() =>
  Number.isInteger(draftYear.value) &&
  draftYear.value >= 1936 &&
  draftYear.value <= 2155 &&
  /^\d{4}-\d{2}-\d{2}$/.test(asOfDate.value) &&
  algorithmVersion.value.trim().length > 0
)

const enqueue = async (): Promise<void> => {
  if (!canSubmit.value) return
  const job = await jobsStore.enqueueGenerateTeamNeeds({
    draftYear: draftYear.value,
    asOfDate: asOfDate.value,
    teamId: teamId.value ?? undefined,
    replaceRecommendations: replaceRecommendations.value,
    algorithmVersion: algorithmVersion.value.trim(),
  })
  localMessage.value = `Queued Team Needs generation job #${job.id}.`
  emit('job-submitted', job.id)
}
</script>

<template>
  <Card class="job-card">
    <template #title>Generate Team Needs</template>
    <template #subtitle>Analyze rosterPlayers and persist reviewable TeamNeed recommendations for all teams or one team.</template>
    <template #content>
      <div class="form-grid">
        <label for="teamNeedsDraftYear" class="field-label">Draft Year</label>
        <InputNumber id="teamNeedsDraftYear" v-model="draftYear" :use-grouping="false" :min="1936" :max="2155" />

        <label for="teamNeedsAsOfDate" class="field-label">Roster As-of Date</label>
        <InputText id="teamNeedsAsOfDate" v-model="asOfDate" placeholder="YYYY-MM-DD" />

        <label for="teamNeedsTeamId" class="field-label">Team ID</label>
        <InputNumber id="teamNeedsTeamId" v-model="teamId" :use-grouping="false" :min="1" placeholder="All teams" />

        <label for="teamNeedsAlgorithm" class="field-label">Algorithm</label>
        <InputText id="teamNeedsAlgorithm" v-model="algorithmVersion" maxlength="32" />

        <div class="field-label">Replacement</div>
        <div class="checkbox-row">
          <Checkbox v-model="replaceRecommendations" input-id="replaceTeamNeeds" binary />
          <label for="replaceTeamNeeds">Replace only unreviewed generated recommendations</label>
        </div>
      </div>
      <Message severity="info" :closable="false" class="mt-3">
        Approved, rejected, manually entered, and overridden rows are preserved.
      </Message>
      <Message v-if="localMessage" severity="success" :closable="false" class="mt-3">{{ localMessage }}</Message>
    </template>
    <template #footer>
      <Button label="Queue Team Needs Job" icon="pi pi-chart-bar" :loading="jobsStore.submitting" :disabled="!canSubmit" @click="enqueue" />
    </template>
  </Card>
</template>

<style scoped>
.job-card { height: 100%; }
.form-grid { display: grid; grid-template-columns: 10rem minmax(12rem, 1fr); gap: 1rem; align-items: center; }
.field-label { font-weight: 700; }
.checkbox-row { display: flex; align-items: center; gap: .5rem; }
.mt-3 { margin-top: 1rem; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
