import { apiService } from '@/services/api'
import type { DuplicateCandidate, IdentityReview, MergeAudit, MergePreview } from '../domain/prospectIdentity.types'

const base = '/prospect-identity'
export const prospectIdentityApi = {
  async listDuplicates(status?: string): Promise<DuplicateCandidate[]> { return (await apiService.get<{rows:DuplicateCandidate[]}>(`${base}/duplicates`, status ? {status} : undefined)).data.rows },
  async listIdentityReviews(status?: string): Promise<IdentityReview[]> { return (await apiService.get<{rows:IdentityReview[]}>(`${base}/identity-reviews`, status ? {status} : undefined)).data.rows },
  async listMergeAudits(): Promise<MergeAudit[]> { return (await apiService.get<{rows:MergeAudit[]}>(`${base}/merge-audits`)).data.rows },
  async enqueueDuplicateScan(): Promise<{id:number}> { return (await apiService.post<{id:number}>(`${base}/duplicates/detect-job`, {})).data },
  async previewMerge(survivorId:number, duplicateId:number): Promise<MergePreview> { return (await apiService.get<MergePreview>(`${base}/merge-preview/${survivorId}/${duplicateId}`)).data },
  async merge(survivorId:number, duplicateId:number, reason:string): Promise<{auditId:number}> { return (await apiService.post<{auditId:number}>(`${base}/merge/${survivorId}/${duplicateId}`, {reason})).data },
  async resolveDuplicate(reviewId:number, status:string, resolution:string, notes:string|null): Promise<void> { await apiService.patch(`${base}/duplicates/${reviewId}`, {status,resolution,notes}) },
  async resolveIdentity(reviewId:number, status:string, resolution:string, notes:string|null): Promise<void> { await apiService.patch(`${base}/identity-reviews/${reviewId}`, {status,resolution,notes}) },
  async deleteProspect(prospectId:number, reason:string): Promise<{auditId:number}> { return (await apiService.post<{auditId:number}>(`${base}/prospects/${prospectId}/delete`, {reason})).data },
}
