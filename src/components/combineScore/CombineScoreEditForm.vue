<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import { useCombineScoreStore } from '@/stores/combineScoreStore'
import { prospectService } from '@/services/prospectService'
import type { CombineScore, Prospect } from '@/types'

interface AutoCompleteEvent { query: string }

const store = useCombineScoreStore()
const router = useRouter()
const toast = useToast()
const combineScore = computed(() => store.currentCombineScore)
const selectedProspect = ref<Prospect | null>(null)
const prospectSuggestions = ref<Prospect[]>([])
const searchingProspects = ref(false)

const form = reactive({
  height: null as number | null,
  weight: null as number | null,
  handSize: null as number | null,
  armLength: null as number | null,
  fortyTime: null as number | null,
  tenYardSplit: null as number | null,
  verticalLeap: null as number | null,
  broadJump: null as number | null,
  threeCone: null as number | null,
  twentyYardShuttle: null as number | null,
  benchPress: null as number | null,
})

const nullable = (value: number | undefined): number | null => value ?? null
const optional = (value: number | null): number | undefined => value ?? undefined
const prospectLabel = (prospect: Prospect) => `${prospect.firstName} ${prospect.lastName} — ${prospect.position} | ${prospect.college}${prospect.draftYear ? ` | ${prospect.draftYear}` : ''}`

const searchProspects = async (event: AutoCompleteEvent) => {
  searchingProspects.value = true
  try {
    const response = await prospectService.getAll({ playerName: event.query.trim() || undefined, page: 1, pageSize: 25 })
    prospectSuggestions.value = response.data
  } finally { searchingProspects.value = false }
}

watch(combineScore, async (score) => {
  if (!score) return
  form.height = nullable(score.height)
  form.weight = nullable(score.weight)
  form.handSize = nullable(score.handSize)
  form.armLength = nullable(score.armLength)
  form.fortyTime = nullable(score.fortyTime)
  form.tenYardSplit = nullable(score.tenYardSplit)
  form.verticalLeap = nullable(score.verticalLeap)
  form.broadJump = nullable(score.broadJump)
  form.threeCone = nullable(score.threeCone)
  form.twentyYardShuttle = nullable(score.twentyYardShuttle)
  form.benchPress = nullable(score.benchPress)
  if (score.prospectId) {
    try { selectedProspect.value = await prospectService.getById(score.prospectId) } catch { selectedProspect.value = null }
  }
}, { immediate: true })

const onSubmit = async () => {
  if (!combineScore.value?.id || !selectedProspect.value?.id) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'A CombineScore and Prospect are required' })
    return
  }

  const payload: Partial<CombineScore> = {
    prospectId: selectedProspect.value.id,
    height: optional(form.height),
    weight: optional(form.weight),
    handSize: optional(form.handSize),
    armLength: optional(form.armLength),
    fortyTime: optional(form.fortyTime),
    tenYardSplit: optional(form.tenYardSplit),
    verticalLeap: optional(form.verticalLeap),
    broadJump: optional(form.broadJump),
    threeCone: optional(form.threeCone),
    twentyYardShuttle: optional(form.twentyYardShuttle),
    benchPress: optional(form.benchPress),
  }

  try {
    await store.update(combineScore.value.id, payload)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Combine measurements updated successfully' })
    router.push(`/combine-scores/${combineScore.value.id}?mode=read`)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update combine measurements' })
  }
}

const onCancel = () => combineScore.value?.id ? router.push(`/combine-scores/${combineScore.value.id}?mode=read`) : router.push('/combine-scores')
</script>

<template>
  <Card v-if="combineScore" class="edit-form">
    <template #title>Edit Combine Measurements</template>
    <template #content>
      <form class="combine-score-form" @submit.prevent="onSubmit">
        <div class="form-grid">
          <div class="form-section prospect-section">
            <h3>Prospect</h3>
            <div class="form-row">
              <label for="prospectSelector">Prospect *</label>
              <AutoComplete id="prospectSelector" v-model="selectedProspect" :suggestions="prospectSuggestions" optionLabel="firstName" dropdown forceSelection :loading="searchingProspects" class="form-input" @complete="searchProspects">
                <template #option="slotProps">{{ prospectLabel(slotProps.option) }}</template>
                <template #value="slotProps">{{ slotProps.value ? prospectLabel(slotProps.value) : '' }}</template>
              </AutoComplete>
            </div>
          </div>
          <div class="form-section">
            <h3>Physical Measurements</h3>
            <div class="form-row"><label for="height">Height</label><InputNumber id="height" v-model="form.height" class="form-input" :useGrouping="false" /><small>Scouting code accepted, e.g. 6016 = 6' 1¾&quot;.</small></div>
            <div class="form-row"><label for="weight">Weight (lbs)</label><InputNumber id="weight" v-model="form.weight" class="form-input" :min="1" /></div>
            <div class="form-row"><label for="handSize">Hand Size</label><InputNumber id="handSize" v-model="form.handSize" class="form-input" :useGrouping="false" /><small>Scouting code accepted, e.g. 868 = 8¾&quot;.</small></div>
            <div class="form-row"><label for="armLength">Arm Length</label><InputNumber id="armLength" v-model="form.armLength" class="form-input" :useGrouping="false" /><small>Scouting code accepted, e.g. 3168 = 31¾&quot;.</small></div>
          </div>
          <div class="form-section">
            <h3>Speed & Agility</h3>
            <div class="form-row"><label for="fortyTime">40-Yard Dash</label><InputNumber id="fortyTime" v-model="form.fortyTime" class="form-input" :minFractionDigits="2" :maxFractionDigits="2" :step="0.01" /></div>
            <div class="form-row"><label for="tenYardSplit">10-Yard Split</label><InputNumber id="tenYardSplit" v-model="form.tenYardSplit" class="form-input" :minFractionDigits="2" :maxFractionDigits="2" :step="0.01" /></div>
            <div class="form-row"><label for="threeCone">3-Cone Drill</label><InputNumber id="threeCone" v-model="form.threeCone" class="form-input" :minFractionDigits="2" :maxFractionDigits="2" :step="0.01" /></div>
            <div class="form-row"><label for="twentyYardShuttle">20-Yard Shuttle</label><InputNumber id="twentyYardShuttle" v-model="form.twentyYardShuttle" class="form-input" :minFractionDigits="2" :maxFractionDigits="2" :step="0.01" /></div>
          </div>
          <div class="form-section">
            <h3>Power & Strength</h3>
            <div class="form-row"><label for="verticalLeap">Vertical Leap (inches)</label><InputNumber id="verticalLeap" v-model="form.verticalLeap" class="form-input" :minFractionDigits="1" :maxFractionDigits="1" /></div>
            <div class="form-row"><label for="broadJump">Broad Jump (inches)</label><InputNumber id="broadJump" v-model="form.broadJump" class="form-input" :minFractionDigits="1" :maxFractionDigits="1" /></div>
            <div class="form-row"><label for="benchPress">Bench Press (reps)</label><InputNumber id="benchPress" v-model="form.benchPress" class="form-input" :useGrouping="false" :min="0" /></div>
          </div>
        </div>
        <div class="form-actions">
          <Button type="button" label="Cancel" severity="secondary" @click="onCancel" />
          <Button type="submit" label="Save Combine Measurements" :loading="store.loading" />
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.edit-form{max-width:1200px;margin:0 auto}.combine-score-form{width:100%}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;margin-bottom:2rem}.prospect-section{grid-column:1/-1}.form-section h3{margin:0 0 1rem;padding-bottom:.5rem;border-bottom:2px solid var(--surface-border)}.form-row{margin-bottom:1rem}.form-row label{display:block;margin-bottom:.4rem;font-weight:600}.form-row small{display:block;margin-top:.35rem;color:var(--text-color-secondary)}.form-input{width:100%}.form-input :deep(.p-autocomplete-input){width:100%}.form-actions{display:flex;justify-content:flex-end;gap:1rem;padding-top:1rem;border-top:1px solid var(--surface-border)}@media(max-width:800px){.form-grid{grid-template-columns:1fr}}
</style>
