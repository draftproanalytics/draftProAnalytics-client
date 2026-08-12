<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { useCombineScoreStore } from '@/stores/combineScoreStore'
import { prospectService } from '@/services/prospectService'
import type { Prospect } from '@/types'
import {
  formatDistanceMeasurement,
  formatHeightMeasurement,
  formatScoutingInches,
  formatTimeMeasurement,
  formatWeightMeasurement,
} from '@/utils/scoutingMeasurements'

const store = useCombineScoreStore()
const router = useRouter()
const combineScore = computed(() => store.currentCombineScore)
const prospect = ref<Prospect | null>(null)

watch(combineScore, async (score) => {
  prospect.value = null
  if (!score?.prospectId) return
  try { prospect.value = await prospectService.getById(score.prospectId) } catch { prospect.value = null }
}, { immediate: true })

const fullName = computed(() => prospect.value ? `${prospect.value.firstName} ${prospect.value.lastName}` : 'Combine Measurements')
const edit = () => { if (combineScore.value?.id) router.push(`/combine-scores/${combineScore.value.id}?mode=edit`) }
const viewProspect = () => { if (prospect.value?.id) router.push(`/prospects/${prospect.value.id}`) }
const formatReps = (value?: number) => value == null ? '—' : `${value} reps`
const status = computed(() => combineScore.value?.isCompleteWorkout ? 'Complete' : 'Partial')
</script>

<template>
  <section v-if="combineScore" class="combine-score-details">
    <h1>Combine Score Profile</h1>
    <div class="detail-header">
      <div>
        <h2>{{ fullName }}</h2>
        <p v-if="prospect">{{ prospect.position }} | {{ prospect.college }} | {{ prospect.draftYear ?? 'Draft year TBD' }}</p>
      </div>
      <div class="header-actions">
        <RouterLink to="/combine-scores" class="return-link"><i class="pi pi-arrow-left" /> Return to Combine Scores</RouterLink>
        <Button v-if="prospect" label="View Prospect" icon="pi pi-user" severity="secondary" outlined @click="viewProspect" />
        <Button label="Edit Measurements" icon="pi pi-pencil" @click="edit" />
      </div>
    </div>

    <div class="status-row"><Tag :value="status" :severity="combineScore.isCompleteWorkout ? 'success' : 'warning'" /></div>

    <div class="measurement-grid">
      <Card><template #title>Physical Measurements</template><template #content>
        <dl>
          <div><dt>Height</dt><dd>{{ formatHeightMeasurement(combineScore.height) }}</dd></div>
          <div><dt>Weight</dt><dd>{{ formatWeightMeasurement(combineScore.weight) }}</dd></div>
          <div><dt>Hand Size</dt><dd>{{ formatScoutingInches(combineScore.handSize) }}</dd></div>
          <div><dt>Arm Length</dt><dd>{{ formatScoutingInches(combineScore.armLength) }}</dd></div>
        </dl>
      </template></Card>

      <Card><template #title>Speed & Agility</template><template #content>
        <dl>
          <div><dt>40-Yard Dash</dt><dd>{{ formatTimeMeasurement(combineScore.fortyTime) }}</dd></div>
          <div><dt>10-Yard Split</dt><dd>{{ formatTimeMeasurement(combineScore.tenYardSplit) }}</dd></div>
          <div><dt>3-Cone Drill</dt><dd>{{ formatTimeMeasurement(combineScore.threeCone) }}</dd></div>
          <div><dt>20-Yard Shuttle</dt><dd>{{ formatTimeMeasurement(combineScore.twentyYardShuttle) }}</dd></div>
        </dl>
      </template></Card>

      <Card><template #title>Power & Strength</template><template #content>
        <dl>
          <div><dt>Vertical Leap</dt><dd>{{ formatDistanceMeasurement(combineScore.verticalLeap) }}</dd></div>
          <div><dt>Broad Jump</dt><dd>{{ formatDistanceMeasurement(combineScore.broadJump) }}</dd></div>
          <div><dt>Bench Press</dt><dd>{{ formatReps(combineScore.benchPress) }}</dd></div>
        </dl>
      </template></Card>
    </div>
  </section>
</template>

<style scoped>
.combine-score-details{width:100%}.combine-score-details>h1{margin:0 0 1rem;font-size:1.75rem}.detail-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:.75rem}.detail-header h2{margin:0}.detail-header p{margin:.3rem 0 0;color:var(--text-color-secondary)}.header-actions{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}.return-link{display:inline-flex;align-items:center;gap:.4rem;color:var(--primary-color);font-weight:600;text-decoration:none;white-space:nowrap}.return-link:hover{text-decoration:underline}.status-row{margin-bottom:1rem}.measurement-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}dl{margin:0}dl div{display:flex;justify-content:space-between;gap:1rem;padding:.6rem 0;border-bottom:1px solid var(--surface-border)}dt{font-weight:600}dd{margin:0;text-align:right}@media(max-width:1000px){.measurement-grid{grid-template-columns:1fr}.detail-header{flex-direction:column}}
</style>
