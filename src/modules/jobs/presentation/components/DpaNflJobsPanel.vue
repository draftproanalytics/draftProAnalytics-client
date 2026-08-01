<script setup lang="ts">
import { ref } from 'vue'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import GenerateTeamNeedsPanel from './GenerateTeamNeedsPanel.vue'
import PostSeasonResultsSyncPanel from './PostSeasonResultsSyncPanel.vue'
import SeasonScheduleImportPanel from './SeasonScheduleImportPanel.vue'
import WeeklyScoresImportPanel from './WeeklyScoresImportPanel.vue'
import JobMonitorPanel from './JobMonitorPanel.vue'
import EspnDraftImportPanel from './EspnDraftImportPanel.vue'
import EspnTeamRosterImportPanel from './EspnTeamRosterImportPanel.vue'
import NflversePlayerProductionPanel from './NflversePlayerProductionPanel.vue'

const emit = defineEmits<{
  readonly 'jobs-submitted': [jobIds: number[]]
}>()

const submittedJobIds: number[] = []
const activeTabIndex = ref(0)

const handleJobSubmitted = (jobId: number): void => {
  submittedJobIds.push(jobId)
  emit('jobs-submitted', [...submittedJobIds])
  activeTabIndex.value = 7
}
</script>

<template>
  <div class="dpa-nfl-jobs-panel">
    <TabView v-model:active-index="activeTabIndex" class="nfl-import-tabs">
      <TabPanel header="Season Schedule">
        <div class="tab-content">
          <SeasonScheduleImportPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="Weekly Scores">
        <div class="tab-content">
          <WeeklyScoresImportPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="Postseason Result">
        <div class="tab-content">
          <PostSeasonResultsSyncPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="Team Needs">
        <div class="tab-content">
          <GenerateTeamNeedsPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="ESPN Draft Data">
        <div class="tab-content">
          <EspnDraftImportPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="Team Roster">
        <div class="tab-content">
          <EspnTeamRosterImportPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="Player Performance">
        <div class="tab-content">
          <NflversePlayerProductionPanel @job-submitted="handleJobSubmitted" />
        </div>
      </TabPanel>

      <TabPanel header="Job Queue">
        <div class="tab-content">
          <JobMonitorPanel />
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped>
.dpa-nfl-jobs-panel {
  min-width: 0;
}

.nfl-import-tabs {
  width: 100%;
}

.tab-content {
  padding-top: 0.75rem;
}

:deep(.p-tabview-nav) {
  flex-wrap: wrap;
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: #013368;
  border-color: #013368;
  color: #ffffff;
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link:hover) {
  background: #013368;
  border-color: #013368;
  color: #ffffff;
}

:deep(.p-tabview-panels) {
  padding: 1rem 0 0;
  background: transparent;
}
</style>
