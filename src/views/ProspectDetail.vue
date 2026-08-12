<!-- src/views/ProspectDetail.vue -->
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import ProspectList from '@/components/prospect/ProspectList.vue'
import ProspectReadOnly from '@/components/prospect/ProspectReadOnly.vue'
import ProspectCreateForm from '@/components/prospect/ProspectCreateForm.vue'
import ProspectEditForm from '@/components/prospect/ProspectEditForm.vue'

const route = useRoute(); const prospectStore = useProspectStore()
const prospectId = computed(() => route.params.id ? Number(route.params.id) : null)
const mode = computed(() => route.meta.prospectMode as 'list'|'create'|'read'|'edit' ?? 'list')
const load = async () => {
  if (prospectId.value && mode.value === 'read') await prospectStore.fetchProfile(prospectId.value)
  else if (prospectId.value && mode.value === 'edit') await prospectStore.fetchById(prospectId.value)
  else prospectStore.clearCurrent()
}
onMounted(() => { void load() }); watch(() => route.fullPath, () => { void load() })
</script>
<template><div class="prospect-detail-view"><ProspectList v-if="mode === 'list'"/><ProspectCreateForm v-else-if="mode === 'create'"/><ProspectEditForm v-else-if="mode === 'edit'"/><ProspectReadOnly v-else/></div></template>
<style scoped>.prospect-detail-view{width:100%}</style>
