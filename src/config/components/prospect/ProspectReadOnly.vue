<!-- src/components/prospect/ProspectReadOnly.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import Tag from 'primevue/tag'

const store = useProspectStore(); const router = useRouter()
const profile = computed(() => store.currentProfile)
const prospect = computed(() => profile.value?.prospect ?? store.currentProspect)
const formatEighths = (eighths: number): string => {
  const fractions: Record<number, string> = {
    0: '',
    1: '⅛',
    2: '¼',
    3: '⅜',
    4: '½',
    5: '⅝',
    6: '¾',
    7: '⅞',
  }

  return fractions[eighths] ?? ''
}

const formatHeight = (height: number | null | undefined): string => {
  if (height == null || height <= 0) return 'N/A'

  // Football scouting height notation uses FIIE:
  // feet (F), whole inches (II), eighths of an inch (E).
  // Example: 6016 = 6' 1 6/8" = 6' 1¾".
  if (Number.isInteger(height) && height >= 1000 && height <= 9999) {
    const encoded = Math.trunc(height).toString().padStart(4, '0')
    const feet = Number(encoded.slice(0, 1))
    const inches = Number(encoded.slice(1, 3))
    const eighths = Number(encoded.slice(3, 4))

    if (feet >= 4 && feet <= 7 && inches >= 0 && inches < 12 && eighths >= 0 && eighths < 8) {
      return `${feet}' ${inches}${formatEighths(eighths)}\"`
    }
  }

  // Fallback for values already stored as total inches/decimal inches.
  const feet = Math.floor(height / 12)
  const inches = height - (feet * 12)
  return `${feet}' ${Number.isInteger(inches) ? inches : inches.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}\"`
}

const formatScoutingInches = (value: number | null | undefined): string => {
  if (value == null || value <= 0) return 'N/A'

  // Football scouting inch notation uses whole inches plus eighths:
  // 868 = 8 6/8" = 8¾"; 3168 = 31 6/8" = 31¾".
  if (Number.isInteger(value) && value >= 100) {
    const encoded = Math.trunc(value).toString()
    const wholeInches = Number(encoded.slice(0, -2))
    const eighths = Number(encoded.slice(-2, -1))
    const denominator = Number(encoded.slice(-1))

    if (wholeInches > 0 && denominator === 8 && eighths >= 0 && eighths < 8) {
      return `${wholeInches}${formatEighths(eighths)}\"`
    }
  }

  return `${value}\"`
}

const formatValue = (value: number | null | undefined, suffix = '') => value == null ? 'N/A' : `${value}${suffix}`
const draftStatusLabel = (status: string | undefined) => status === 'DRAFTED' ? 'Drafted' : status === 'UDFA' ? 'UDFA' : 'Pre-Draft'
const draftStatusSeverity = (status: string | undefined) => status === 'DRAFTED' ? 'success' : status === 'UDFA' ? 'warning' : 'info'
const edit = () => { if (prospect.value?.id) router.push(`/prospects/${prospect.value.id}/edit`) }
</script>

<template>
  <div v-if="prospect" class="prospect-profile">
    <h1 class="page-title">Prospect Profile</h1>

    <div class="profile-header">
      <div class="prospect-identity">
        <h2>{{ prospect.firstName }} {{ prospect.lastName }}</h2>
        <p>{{ prospect.position }} | {{ prospect.college }} | {{ prospect.draftYear ?? 'Draft year TBD' }}</p>
      </div>
      <div class="profile-actions">
        <RouterLink to="/prospects" class="return-link">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>Return to Prospect List</span>
        </RouterLink>
        <Button label="Edit Prospect" icon="pi pi-pencil" @click="edit" />
      </div>
    </div>

    <TabView>
      <TabPanel header="Overview">
        <div class="overview-grid">
          <Card><template #title>Identity</template><template #content>
            <dl><div><dt>Position</dt><dd>{{ prospect.position }}</dd></div><div><dt>College</dt><dd>{{ prospect.college }}</dd></div><div><dt>Draft Year</dt><dd>{{ prospect.draftYear ?? 'N/A' }}</dd></div><div><dt>Status</dt><dd><Tag :value="draftStatusLabel(prospect.draftStatus)" :severity="draftStatusSeverity(prospect.draftStatus)" /></dd></div></dl>
          </template></Card>
          <Card><template #title>Measurements</template><template #content>
            <dl><div><dt>Height</dt><dd>{{ formatHeight(profile?.combine.height) }}</dd></div><div><dt>Weight</dt><dd>{{ formatValue(profile?.combine.weight, ' lbs') }}</dd></div><div><dt>Hand Size</dt><dd>{{ formatScoutingInches(profile?.combine.handSize) }}</dd></div><div><dt>Arm Length</dt><dd>{{ formatScoutingInches(profile?.combine.armLength) }}</dd></div></dl>
          </template></Card>
        </div>
      </TabPanel>

      <TabPanel header="Combine">
        <div v-if="profile?.combine && profile.combine.source !== 'NONE'" class="metric-grid combine-metric-grid">
          <div><span>40-Yard Dash</span><strong>{{ formatValue(profile.combine.fortyTime, 's') }}</strong></div><div><span>10-Yard Split</span><strong>{{ formatValue(profile.combine.tenYardSplit, 's') }}</strong></div>
          <div><span>Vertical Leap</span><strong>{{ formatValue(profile.combine.verticalLeap, '"') }}</strong></div><div><span>Broad Jump</span><strong>{{ formatValue(profile.combine.broadJump, '"') }}</strong></div>
          <div><span>3-Cone</span><strong>{{ formatValue(profile.combine.threeCone, 's') }}</strong></div><div><span>20-Yard Shuttle</span><strong>{{ formatValue(profile.combine.twentyYardShuttle, 's') }}</strong></div>
          <div><span>Bench Press</span><strong>{{ formatValue(profile.combine.benchPress, ' reps') }}</strong></div>
          <div><span>Source</span><strong>CombineScore</strong></div>
        </div>
        <p v-else class="empty-state">No combine measurements are available for this prospect.</p>
      </TabPanel>

      <TabPanel header="Production"><p class="empty-state">Production metrics will be integrated in a later NFL Draft Epic phase.</p></TabPanel>

      <TabPanel header="B4Me Analysis">
        <div v-if="profile?.b4me" class="metric-grid">
          <div><span>Final B4Me Score</span><strong>{{ formatValue(profile.b4me.finalB4MeScore) }}</strong></div><div><span>Scoring Mode</span><strong>{{ profile.b4me.scoringMode }}</strong></div>
          <div><span>Coachability</span><strong>{{ profile.b4me.coachabilityTier ?? 'N/A' }}</strong></div><div><span>RFA Tier</span><strong>{{ profile.b4me.rfaTier ?? 'N/A' }}</strong></div><div><span>RVA Tier</span><strong>{{ profile.b4me.rvaTier ?? 'N/A' }}</strong></div>
        </div>
        <p v-else class="empty-state">No B4Me evaluation is available for this prospect.</p>
      </TabPanel>

      <TabPanel header="Scouting"><p class="empty-state">Scouting notes and evaluations will be integrated in a later NFL Draft Epic phase.</p></TabPanel>

      <TabPanel header="Rankings">
        <DataTable v-if="profile?.rankings.length" :value="profile.rankings" responsiveLayout="scroll"><Column field="source" header="Source"/><Column field="overallRank" header="Overall Rank"/><Column field="positionRank" header="Position Rank"/><Column field="grade" header="Grade"/></DataTable>
        <p v-else class="empty-state">No rankings are available for this prospect.</p>
      </TabPanel>

      <TabPanel header="Draft History">
        <DataTable v-if="profile?.draftHistory.length" :value="profile.draftHistory" responsiveLayout="scroll"><Column field="draftYear" header="Year"/><Column field="round" header="Round"/><Column field="pickNumber" header="Overall Pick"/><Column field="pickInRound" header="Pick in Round"/><Column field="status" header="Status"/><Column field="currentTeamId" header="Team ID"/></DataTable>
        <p v-else class="empty-state">This prospect has not been associated with a DraftPick.</p>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped>
.prospect-profile{width:100%}.page-title{margin:0 0 1rem;font-size:1.75rem;font-weight:600}.profile-header{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem}.prospect-identity{min-width:0}.profile-header h2{margin:0}.profile-header p{margin:.25rem 0 0;color:var(--text-color-secondary)}.profile-actions{display:flex;align-items:center;gap:1rem;flex-shrink:0}.return-link{display:inline-flex;align-items:center;gap:.45rem;color:var(--primary-color);font-weight:600;text-decoration:none;white-space:nowrap}.return-link:hover{text-decoration:underline}.overview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}dl{margin:0}dl div{display:flex;justify-content:space-between;padding:.55rem 0;border-bottom:1px solid var(--surface-border)}dt{font-weight:600}.metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}.metric-grid div{padding:1rem;border:1px solid var(--surface-border);border-radius:6px;display:flex;flex-direction:column;gap:.4rem;min-width:0}.metric-grid span{color:var(--text-color-secondary);font-size:.9rem}.combine-metric-grid{grid-template-columns:repeat(8,minmax(0,1fr));gap:.75rem}.combine-metric-grid div{padding:.75rem}.combine-metric-grid span{font-size:.8rem}.combine-metric-grid strong{font-size:.95rem;overflow-wrap:anywhere}.empty-state{padding:1.5rem;color:var(--text-color-secondary);text-align:center}@media (max-width:1100px){.combine-metric-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media (max-width:720px){.profile-header{align-items:flex-start;flex-direction:column}.profile-actions{width:100%;justify-content:space-between}.combine-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
