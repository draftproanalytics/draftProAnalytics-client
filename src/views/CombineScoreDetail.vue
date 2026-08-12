<!-- src/views/CombineScoreDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCombineScoreStore } from '@/stores/combineScoreStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import CombineScoreList from '@/components/combineScore/CombineScoreList.vue'
import CombineScoreReadOnly from '@/components/combineScore/CombineScoreReadOnly.vue'
import CombineScoreCreateForm from '@/components/combineScore/CombineScoreCreateForm.vue'
import CombineScoreEditForm from '@/components/combineScore/CombineScoreEditForm.vue'

const route = useRoute()
const router = useRouter()
const combineScoreStore = useCombineScoreStore()

const combineScoreId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => typeof route.query.mode === 'string' ? route.query.mode : 'read')

const isCrudMode = (value: string): value is 'read' | 'create' | 'edit' | 'delete' =>
  ['read', 'create', 'edit', 'delete'].includes(value)

onMounted(async () => {
  combineScoreStore.setMode(isCrudMode(mode.value) ? mode.value : 'read')
  if (combineScoreId.value) {
    await combineScoreStore.fetchById(combineScoreId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      combineScoreStore.setMode(typeof newMode === 'string' && isCrudMode(newMode) ? newMode : 'read')
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await combineScoreStore.fetchById(parseInt(newId as string))
    } else {
      combineScoreStore.clearCurrent()
    }
  }
)
</script>

<template>
  
    <div class="combine-score-detail-view">
      <!-- Show list when no ID -->
      <CombineScoreCreateForm v-if="mode === 'create'" />

      <!-- Show list when no ID -->
      <CombineScoreList v-else-if="!combineScoreId" />

      <!-- Show edit form -->
      <CombineScoreEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <CombineScoreReadOnly v-else />
    </div>
 
</template>

<style scoped>
.combine-score-detail-view {
  width: 100%;
}
</style>