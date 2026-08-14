import { defineStore } from 'pinia'
import { ref } from 'vue'
import { prospectIdentityApi } from './prospectIdentityApi'
import type { DuplicateCandidate, IdentityReview, MergeAudit, MergePreview } from '../domain/prospectIdentity.types'

export const useProspectIdentityStore = defineStore('prospectIdentity', () => {
  const duplicates = ref<DuplicateCandidate[]>([])
  const identityReviews = ref<IdentityReview[]>([])
  const mergeAudits = ref<MergeAudit[]>([])
  const mergePreview = ref<MergePreview|null>(null)
  const loading = ref(false)
  const errorMessage = ref<string|null>(null)
  const refresh = async ():Promise<void> => { loading.value=true; errorMessage.value=null; try { const [d,i,a]=await Promise.all([prospectIdentityApi.listDuplicates(), prospectIdentityApi.listIdentityReviews(), prospectIdentityApi.listMergeAudits()]); duplicates.value=d; identityReviews.value=i; mergeAudits.value=a } catch(e) { errorMessage.value=e instanceof Error?e.message:'Prospect identity request failed.'; throw e } finally { loading.value=false } }
  const preview = async (survivorId:number, duplicateId:number):Promise<void> => { mergePreview.value=await prospectIdentityApi.previewMerge(survivorId,duplicateId) }
  const merge = async (survivorId:number, duplicateId:number, reason:string):Promise<void> => { await prospectIdentityApi.merge(survivorId,duplicateId,reason); mergePreview.value=null; await refresh() }
  return { duplicates, identityReviews, mergeAudits, mergePreview, loading, errorMessage, refresh, preview, merge }
})
