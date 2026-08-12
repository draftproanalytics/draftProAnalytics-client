<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import { useTeamStore } from '@/stores/teamStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import type { Prospect, ProspectDraftStatus } from '@/types'

const prospectStore = useProspectStore()
const teamStore = useTeamStore()
const router = useRouter()
const toast = useToast()
const prospect = computed(() => prospectStore.currentProspect)

const form = reactive({
  firstName: '', lastName: '', position: '', college: '', homeCity: '', homeState: '', draftStatus: 'PRE_DRAFT' as ProspectDraftStatus,
  draftYear: undefined as number | undefined, teamId: undefined as number | undefined, draftPickId: undefined as number | undefined,
})
const positions = [
  { label: 'Quarterback', value: 'QB' }, { label: 'Running Back', value: 'RB' }, { label: 'Wide Receiver', value: 'WR' },
  { label: 'Tight End', value: 'TE' }, { label: 'Offensive Tackle', value: 'OT' }, { label: 'Interior Offensive Line', value: 'IOL' },
  { label: 'Edge', value: 'EDGE' }, { label: 'Defensive Line', value: 'DL' }, { label: 'Linebacker', value: 'LB' },
  { label: 'Cornerback', value: 'CB' }, { label: 'Safety', value: 'S' }, { label: 'Kicker', value: 'K' }, { label: 'Punter', value: 'P' },
]
const draftStatuses = [
  { label: 'Pre-Draft', value: 'PRE_DRAFT' },
  { label: 'Drafted', value: 'DRAFTED' },
  { label: 'UDFA', value: 'UDFA' },
]
const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const draftYears = Array.from({ length: 16 }, (_, i) => { const year = new Date().getFullYear() + 5 - i; return { label: year.toString(), value: year } })

const populate = () => {
  const value = prospect.value
  if (!value) return
  form.firstName = value.firstName
  form.lastName = value.lastName
  form.position = value.position
  form.college = value.college
  form.homeCity = value.homeCity ?? ''
  form.homeState = value.homeState ?? ''
  form.draftStatus = value.draftStatus ?? (value.drafted ? 'DRAFTED' : 'PRE_DRAFT')
  form.draftYear = value.draftYear
  form.teamId = value.teamId
  form.draftPickId = value.draftPickId
}
watch(prospect, populate, { immediate: true })
onMounted(async () => { await teamStore.fetchAll(); populate() })

const onSubmit = async () => {
  if (!prospect.value?.id) return
  try {
    const payload: Partial<Prospect> = {
      firstName: form.firstName,
      lastName: form.lastName,
      position: form.position,
      college: form.college,
      homeCity: form.homeCity || undefined,
      homeState: form.homeState || undefined,
      drafted: form.draftStatus === 'DRAFTED',
      draftStatus: form.draftStatus,
      draftYear: form.draftYear,
      teamId: form.teamId,
      draftPickId: form.draftPickId,
    }
    const id = prospect.value.id
    await prospectStore.update(id, payload)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Prospect updated successfully' })
    router.push(`/prospects/${id}`)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update prospect' })
  }
}
const onCancel = () => router.push(prospect.value?.id ? `/prospects/${prospect.value.id}` : '/prospects')
</script>

<template>
  <Card class="edit-form">
    <template #title>Edit Prospect<span v-if="prospect">: {{ prospect.firstName }} {{ prospect.lastName }}</span></template>
    <template #content>
      <form class="prospect-form" @submit.prevent="onSubmit">
        <div class="form-grid">
          <section class="form-section">
            <h3>Identity</h3>
            <div class="form-row"><label for="firstName">First Name *</label><InputText id="firstName" v-model="form.firstName" required /></div>
            <div class="form-row"><label for="lastName">Last Name *</label><InputText id="lastName" v-model="form.lastName" required /></div>
            <div class="form-row"><label for="position">Position *</label><Dropdown id="position" v-model="form.position" :options="positions" optionLabel="label" optionValue="value" required /></div>
            <div class="form-row"><label for="college">College *</label><InputText id="college" v-model="form.college" required /></div>
          </section>
          <section class="form-section">
            <h3>Background</h3>
            <div class="form-row"><label for="homeCity">Hometown City</label><InputText id="homeCity" v-model="form.homeCity" /></div>
            <div class="form-row"><label for="homeState">Home State</label><Dropdown id="homeState" v-model="form.homeState" :options="states" showClear /></div>
          </section>
          <section class="form-section">
            <h3>Draft Status</h3>
            <div class="form-row"><label for="draftStatus">Draft Status</label><Dropdown id="draftStatus" v-model="form.draftStatus" :options="draftStatuses" optionLabel="label" optionValue="value" /></div>
            <div class="form-row"><label for="draftYear">Draft Year</label><Dropdown id="draftYear" v-model="form.draftYear" :options="draftYears" optionLabel="label" optionValue="value" /></div>
            <div v-if="form.draftStatus !== 'PRE_DRAFT'" class="form-row"><label for="teamId">{{ form.draftStatus === 'UDFA' ? 'Signing / Current Team' : 'Current Team' }}</label><Dropdown id="teamId" v-model="form.teamId" :options="teamStore.teams" optionLabel="name" optionValue="id" showClear /></div>
          </section>
          <section class="form-section measurement-note">
            <h3>Measurements</h3>
            <p>Physical measurements and athletic testing are edited in Combine Scores. They are no longer stored on Prospect.</p>
          </section>
        </div>
        <div class="form-actions"><Button type="submit" label="Save Changes" icon="pi pi-check" /><Button type="button" label="Cancel" severity="secondary" outlined @click="onCancel" /></div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.edit-form{max-width:1000px;margin:0 auto}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}.form-section{padding:1rem;border:1px solid var(--surface-border);border-radius:6px}.form-section h3{margin-top:0}.form-row{display:flex;flex-direction:column;gap:.35rem;margin-bottom:1rem}.checkbox-wrapper{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem}.form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1rem}.measurement-note p{color:var(--text-color-secondary);line-height:1.5}
</style>
