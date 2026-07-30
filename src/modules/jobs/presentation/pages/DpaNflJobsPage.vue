<script setup lang="ts">
import DpaNflJobsPanel from '../components/DpaNflJobsPanel.vue'

const handleJobsSubmitted = (jobIds: number[]): void => {
  console.info('DPA NFL import jobs submitted:', jobIds)
}
</script>

<template>
  <section class="dpa-nfl-jobs-page">
    <div class="page-header">
      <h2>NFL Imports</h2>
      <p>Import schedule and score data, synchronize postseason results, and generate team needs.</p>
    </div>

    <DpaNflJobsPanel @jobs-submitted="handleJobsSubmitted" />
  </section>
</template>

<style scoped>
.dpa-nfl-jobs-page,
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  gap: 0.35rem;
}

.page-header h2,
.page-header p {
  margin: 0;
}
</style>
