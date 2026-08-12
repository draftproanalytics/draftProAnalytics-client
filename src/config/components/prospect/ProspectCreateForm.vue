<script setup lang="ts">
import { reactive, onMounted } from 'vue'
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

const form = reactive({
  firstName: '',
  lastName: '',
  position: '',
  college: '',
  homeCity: '',
  homeState: '',
  draftStatus: 'PRE_DRAFT' as ProspectDraftStatus,
  draftYear: undefined as number | undefined,
  teamId: undefined as number | undefined,
  draftPickId: undefined as number | undefined,
})

const positions = [
  { label: 'Quarterback', value: 'QB' }, { label: 'Running Back', value: 'RB' },
  { label: 'Wide Receiver', value: 'WR' }, { label: 'Tight End', value: 'TE' },
  { label: 'Offensive Tackle', value: 'OT' }, { label: 'Interior Offensive Line', value: 'IOL' },
  { label: 'Edge', value: 'EDGE' }, { label: 'Defensive Line', value: 'DL' },
  { label: 'Linebacker', value: 'LB' }, { label: 'Cornerback', value: 'CB' },
  { label: 'Safety', value: 'S' }, { label: 'Kicker', value: 'K' }, { label: 'Punter', value: 'P' },
]
const draftStatuses = [
  { label: 'Pre-Draft', value: 'PRE_DRAFT' },
  { label: 'Drafted', value: 'DRAFTED' },
  { label: 'UDFA', value: 'UDFA' },
]
const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const draftYears = Array.from({ length: 16 }, (_, i) => {
  const year = new Date().getFullYear() + 5 - i
  return { label: year.toString(), value: year }
})

onMounted(() => teamStore.fetchAll())

const onSubmit = async () => {
  try {
    const payload: Omit<Prospect, 'id'> = {
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
    await prospectStore.create(payload)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Prospect created successfully' })
    router.push('/prospects')
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create prospect' })
  }
}
const onCancel = () => router.push('/prospects')
</script>

<template>
  <Card class="create-form">
    <template #title>Create New Prospect</template>
    <template #content>
      <form class="prospect-form" @submit.prevent="onSubmit">
        <div class="form-grid">
          <section class="form-section">
            <h3>Identity</h3>
            <div class="form-row"><label for="firstName">First Name *</label><InputText id="firstName" v-model="form.firstName" required /></div>
            <div class="form-row"><label for="lastName">Last Name *</label><InputText id="lastName" v-model="form.lastName" required /></div>
            <div class="form-row"><label for="position">Position *</label><Dropdown id="position" v-model="form.position" :options="positions" optionLabel="label" optionValue="value" placeholder="Select Position" required /></div>
            <div class="form-row"><label for="college">College *</label><InputText id="college" v-model="form.college" required /></div>
          </section>
          <section class="form-section">
            <h3>Background</h3>
            <div class="form-row"><label for="homeCity">Hometown City</label><InputText id="homeCity" v-model="form.homeCity" /></div>
            <div class="form-row"><label for="homeState">Home State</label><Dropdown id="homeState" v-model="form.homeState" :options="states" placeholder="Select State" showClear /></div>
          </section>
          <section class="form-section">
            <h3>Draft Status</h3>
            <div class="form-row"><label for="draftStatus">Draft Status</label><Dropdown id="draftStatus" v-model="form.draftStatus" :options="draftStatuses" optionLabel="label" optionValue="value" /></div>
            <div class="form-row"><label for="draftYear">Draft Year</label><Dropdown id="draftYear" v-model="form.draftYear" :options="draftYears" optionLabel="label" optionValue="value" /></div>
            <div v-if="form.draftStatus !== 'PRE_DRAFT'" class="form-row"><label for="teamId">{{ form.draftStatus === 'UDFA' ? 'Signing / Current Team' : 'Current Team' }}</label><Dropdown id="teamId" v-model="form.teamId" :options="teamStore.teams" optionLabel="name" optionValue="id" showClear /></div>
          </section>
          <section class="form-section measurement-note">
            <h3>Measurements</h3>
            <p>Physical measurements and athletic testing are maintained in Combine Scores and attach to this Prospect after creation.</p>
          </section>
        </div>
        <div class="form-actions"><Button type="submit" label="Create Prospect" icon="pi pi-check" /><Button type="button" label="Cancel" severity="secondary" outlined @click="onCancel" /></div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.create-form{max-width:1000px;margin:0 auto}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}.form-section{padding:1rem;border:1px solid var(--surface-border);border-radius:6px}.form-section h3{margin-top:0}.form-row{display:flex;flex-direction:column;gap:.35rem;margin-bottom:1rem}.checkbox-wrapper{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem}.form-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1rem}.measurement-note p{color:var(--text-color-secondary);line-height:1.5}
</style>
