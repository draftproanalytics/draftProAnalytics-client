<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import Tag from 'primevue/tag'
import { useProspectIdentityStore } from '../application/useProspectIdentityStore'
import { prospectIdentityApi } from '../application/prospectIdentityApi'
import type { DuplicateCandidate, IdentityReview } from '../domain/prospectIdentity.types'

const store = useProspectIdentityStore()
const previewVisible = ref(false)
const reason = ref('')
const scanJobId = ref<number|null>(null)
const actionError = ref<string|null>(null)

const nameOf = (p: DuplicateCandidate['left']):string => p ? `${p.firstName} ${p.lastName}`.trim() : '(deleted)'

const openMerge = async (row:DuplicateCandidate, survivor:'left'|'right'):Promise<void> => {
  if (!row.left || !row.right) return
  reason.value=''
  const survivorId=survivor==='left'?row.left.id:row.right.id
  const duplicateId=survivor==='left'?row.right.id:row.left.id
  await store.preview(survivorId,duplicateId)
  previewVisible.value=true
}
const executeMerge = async ():Promise<void> => {
  const p=store.mergePreview
  if (!p) return
  actionError.value=null
  try { await store.merge(p.survivor.id,p.duplicate.id,reason.value); previewVisible.value=false } catch(e) { actionError.value=e instanceof Error?e.message:'Merge failed.' }
}
const resolveDuplicate = async (row:DuplicateCandidate,status:string,resolution:string):Promise<void> => { await prospectIdentityApi.resolveDuplicate(row.id,status,resolution,null); await store.refresh() }
const resolveIdentity = async (row:IdentityReview,status:string,resolution:string):Promise<void> => { await prospectIdentityApi.resolveIdentity(row.id,status,resolution,null); await store.refresh() }
const queueScan = async ():Promise<void> => { const job=await prospectIdentityApi.enqueueDuplicateScan(); scanJobId.value=job.id }
const deleteDuplicate = async ():Promise<void> => {
  const p=store.mergePreview
  if (!p) return
  actionError.value=null
  try { await prospectIdentityApi.deleteProspect(p.duplicate.id, reason.value); previewVisible.value=false; await store.refresh() } catch(e) { actionError.value=e instanceof Error?e.message:'Delete blocked.' }
}

onMounted(() => void store.refresh())
</script>

<template>
  <section class="identity-page">
    <div class="page-header">
      <div>
        <h2>Prospect Identity Management</h2>
        <p>Review duplicate candidates and provider identity mismatches before prospect data is merged or hydrated.</p>
      </div>
      <div class="header-actions">
        <Button label="Scan for Duplicates" icon="pi pi-search" @click="queueScan" />
        <Button label="Refresh" icon="pi pi-refresh" severity="secondary" :loading="store.loading" @click="store.refresh" />
      </div>
    </div>

    <Message v-if="scanJobId" severity="info" :closable="false">Duplicate scan queued as Job #{{ scanJobId }}. Run/process the normal Job Queue to execute it.</Message>
    <Message v-if="store.errorMessage" severity="error" :closable="false">{{ store.errorMessage }}</Message>

    <TabView>
      <TabPanel header="Duplicate Candidates">
        <DataTable :value="store.duplicates" data-key="id" paginator :rows="20" striped-rows>
          <Column header="Left Prospect"><template #body="{data}">{{ nameOf(data.left) }}</template></Column>
          <Column header="Right Prospect"><template #body="{data}">{{ nameOf(data.right) }}</template></Column>
          <Column header="Draft Year"><template #body="{data}">{{ data.left?.draftYear ?? data.right?.draftYear ?? '—' }}</template></Column>
          <Column header="Position"><template #body="{data}">{{ data.left?.position ?? data.right?.position ?? '—' }}</template></Column>
          <Column header="College"><template #body="{data}">{{ data.left?.college }} / {{ data.right?.college }}</template></Column>
          <Column field="matchScore" header="Score" sortable />
          <Column field="status" header="Status"><template #body="{data}"><Tag :value="data.status" /></template></Column>
          <Column header="Actions" style="min-width: 27rem">
            <template #body="{data}">
              <div class="row-actions" v-if="data.status === 'OPEN' || data.status === 'DEFERRED'">
                <Button size="small" label="Merge into Left" :disabled="!data.left || !data.right" @click="openMerge(data,'left')" />
                <Button size="small" label="Merge into Right" :disabled="!data.left || !data.right" @click="openMerge(data,'right')" />
                <Button size="small" label="Not Duplicate" severity="secondary" @click="resolveDuplicate(data,'NOT_DUPLICATE','NOT_DUPLICATE')" />
                <Button size="small" label="Defer" severity="secondary" @click="resolveDuplicate(data,'DEFERRED','DEFER')" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Provider Identity Reviews">
        <DataTable :value="store.identityReviews" data-key="id" paginator :rows="20" striped-rows>
          <Column field="requestedName" header="Requested" />
          <Column field="resolvedName" header="Provider Candidate" />
          <Column field="provider" header="Provider" />
          <Column field="confidenceScore" header="Confidence" />
          <Column field="reason" header="Reason" />
          <Column field="status" header="Status"><template #body="{data}"><Tag :value="data.status" /></template></Column>
          <Column header="Actions">
            <template #body="{data}">
              <div class="row-actions" v-if="data.status === 'OPEN' || data.status === 'DEFERRED'">
                <Button size="small" label="Dismiss" severity="secondary" @click="resolveIdentity(data,'DISMISSED','NOT_SAME_PERSON')" />
                <Button size="small" label="Defer" severity="secondary" @click="resolveIdentity(data,'DEFERRED','DEFER')" />
                <Button size="small" label="Resolve" @click="resolveIdentity(data,'RESOLVED','IDENTITY_CONFIRMED')" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Resolved / Audit">
        <DataTable :value="store.mergeAudits" data-key="id" paginator :rows="20" striped-rows>
          <Column field="id" header="Audit #" />
          <Column field="survivorProspectId" header="Survivor" />
          <Column field="duplicateProspectId" header="Duplicate" />
          <Column field="mergePolicy" header="Policy" />
          <Column field="performedByPersonId" header="Performed By" />
          <Column field="performedAt" header="Performed At" />
          <Column field="reason" header="Reason" />
        </DataTable>
      </TabPanel>
    </TabView>

    <Dialog v-model:visible="previewVisible" modal header="Merge Preview" :style="{width:'72rem'}">
      <div v-if="store.mergePreview" class="preview-grid">
        <div><h3>Survivor</h3><strong>{{ store.mergePreview.survivor.firstName }} {{ store.mergePreview.survivor.lastName }}</strong><div>{{ store.mergePreview.survivor.college }} · {{ store.mergePreview.survivor.position }} · {{ store.mergePreview.survivor.draftYear }}</div></div>
        <div><h3>Duplicate</h3><strong>{{ store.mergePreview.duplicate.firstName }} {{ store.mergePreview.duplicate.lastName }}</strong><div>{{ store.mergePreview.duplicate.college }} · {{ store.mergePreview.duplicate.position }} · {{ store.mergePreview.duplicate.draftYear }}</div></div>
      </div>
      <div v-if="store.mergePreview" class="preview-sections">
        <div><h3>Fill empty survivor fields</h3><pre>{{ JSON.stringify(store.mergePreview.fieldsCopied, null, 2) }}</pre></div>
        <div><h3>Relations to move</h3><pre>{{ JSON.stringify(store.mergePreview.relationsToMove, null, 2) }}</pre></div>
        <div><h3>Conflicts — survivor preserved</h3><pre>{{ JSON.stringify(store.mergePreview.conflicts, null, 2) }}</pre></div>
      </div>
      <label class="reason-field">Resolution reason <InputText v-model="reason" /></label>
      <Message v-if="actionError" severity="error" :closable="false">{{ actionError }}</Message>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="previewVisible=false" />
        <Button label="Delete Duplicate" severity="danger" outlined :disabled="reason.trim().length < 3" @click="deleteDuplicate" />
        <Button label="Confirm FILL_EMPTY_ONLY Merge" :disabled="reason.trim().length < 3" @click="executeMerge" />
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.identity-page{padding:1.25rem}.page-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1rem}.page-header h2{margin:0}.page-header p{margin:.35rem 0 0}.header-actions,.row-actions{display:flex;gap:.5rem;flex-wrap:wrap}.preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.preview-sections{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-top:1rem}.preview-sections pre{white-space:pre-wrap;max-height:22rem;overflow:auto;background:#f6f7f9;padding:.75rem;border-radius:.35rem}.reason-field{display:flex;flex-direction:column;gap:.4rem;margin-top:1rem}.reason-field input{width:100%}@media(max-width:900px){.page-header,.preview-grid,.preview-sections{display:block}.header-actions{margin-top:1rem}}
</style>
