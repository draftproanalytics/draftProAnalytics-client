<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Divider from "primevue/divider";
import InputNumber from "primevue/inputnumber";
import { useTeamNeedsStore } from "../../application/stores/useTeamNeedsStore";
import type { TeamNeedDto, TeamNeedSuggestionDto } from "../../domain/dtos/TeamNeedDtos";
import TeamTalentAssessmentPanel from "./TeamTalentAssessmentPanel.vue";

const route = useRoute();
const store = useTeamNeedsStore();
const teamId = computed(() => Number(route.params.teamId));
const selectedDraftYear = ref(new Date().getFullYear() + 1);
const editing = ref<Record<string, { priority: number; draftYear: number }>>({});

function editKey(position: string, draftYear: number): string {
  return `${draftYear}:${position}`;
}

function prioritySeverity(priority: number): "success" | "info" | "warning" | "danger" {
  if (priority === 1) return "danger";
  if (priority === 2) return "warning";
  if (priority === 3) return "info";
  return "success";
}

function ensureEditRow(need: TeamNeedDto): void {
  const key = editKey(need.position, need.draftYear);
  if (!editing.value[key]) {
    editing.value[key] = { priority: need.priority, draftYear: need.draftYear };
  }
}

function editRow(need: TeamNeedDto): { priority: number; draftYear: number } {
  ensureEditRow(need);
  return editing.value[editKey(need.position, need.draftYear)];
}

async function loadNeeds(): Promise<void> {
  if (Number.isInteger(teamId.value) && Number.isInteger(selectedDraftYear.value)) {
    await store.load(teamId.value, selectedDraftYear.value);
  }
}

async function saveNeed(need: TeamNeedDto): Promise<void> {
  const draft = editRow(need);
  await store.saveNeed(teamId.value, {
    position: need.position,
    priority: draft.priority,
    draftYear: draft.draftYear
  });
}

async function applySuggestion(suggestion: TeamNeedSuggestionDto): Promise<void> {
  await store.applySuggestion(teamId.value, suggestion);
}

async function reviewNeed(need: TeamNeedDto, status: 'APPROVED' | 'REJECTED'): Promise<void> {
  await store.reviewNeed(need.id, status);
}

async function deleteNeed(need: TeamNeedDto): Promise<void> {
  await store.deleteNeed(teamId.value, need.draftYear, need.position);
}

const persistedNeedsSorted = computed(() =>
  [...store.persistedNeeds].sort((a, b) => a.priority - b.priority || a.position.localeCompare(b.position))
);

onMounted(loadNeeds);
</script>

<template>
  <div class="p-4">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 class="text-2xl font-semibold">Team Needs</h2>
        <div class="opacity-80 text-sm" v-if="store.evaluationYear">
          Evaluation year: {{ store.evaluationYear }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label for="draft-year" class="text-sm font-medium">Draft year</label>
        <InputNumber
          id="draft-year"
          v-model="selectedDraftYear"
          :useGrouping="false"
          :min="1936"
          :max="2155"
          inputClass="w-7rem"
        />
        <Button label="Load" icon="pi pi-refresh" :loading="store.isLoading" @click="loadNeeds" />
      </div>
    </div>

    <div v-if="store.error" class="mb-3 p-3 border-round surface-100 text-red-600">
      {{ store.error }}
    </div>

    <div class="grid gap-4" style="grid-template-columns: 1fr;">
      <Card>
        <template #title>Suggested needs (computed)</template>
        <template #content>
          <DataTable :value="store.suggestions" dataKey="position" :loading="store.isLoading" responsiveLayout="scroll">
            <Column field="position" header="Pos" style="width: 90px" />
            <Column header="Priority" style="width: 120px">
              <template #body="{ data }">
                <Tag :value="data.priority" :severity="prioritySeverity(data.priority)" />
              </template>
            </Column>
            <Column header="Roster" style="width: 140px">
              <template #body="{ data }">
                <div class="text-sm">
                  {{ data.rosterCount }} players
                  <span v-if="data.avgAge !== null"> · avg {{ data.avgAge }}</span>
                </div>
                <div v-if="data.expiringCount > 0" class="text-xs opacity-80">
                  {{ data.expiringCount }} expiring
                </div>
              </template>
            </Column>
            <Column header="Why">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Tag v-for="(r, idx) in data.reasons" :key="idx" :value="r" severity="info" />
                </div>
              </template>
            </Column>
            <Column header="" style="width: 140px">
              <template #body="{ data }">
                <Button label="Apply" icon="pi pi-check" size="small" @click="applySuggestion(data)" />
              </template>
            </Column>
          </DataTable>

          <div v-if="!store.isLoading && store.suggestions.length === 0" class="opacity-70 mt-2">
            No meaningful needs detected (or roster data is incomplete).
          </div>
        </template>
      </Card>

      <Divider />

      <TeamTalentAssessmentPanel :teamId="teamId" :draftYear="selectedDraftYear" />

      <Divider />

      <Card>
        <template #title>Saved needs (persisted)</template>
        <template #content>
          <DataTable :value="persistedNeedsSorted" dataKey="position" :loading="store.isLoading" responsiveLayout="scroll">
            <Column field="position" header="Pos" style="width: 90px" />
            <Column header="Priority" style="width: 220px">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <Tag :value="data.priority" :severity="prioritySeverity(data.priority)" />
                  <InputNumber
                    v-model="editRow(data).priority"
                    :min="1"
                    :max="5"
                    :useGrouping="false"
                    inputClass="w-6rem"
                    @focus="ensureEditRow(data)"
                  />
                </div>
              </template>
            </Column>
            <Column header="Draft year" style="width: 220px">
              <template #body="{ data }">
                <InputNumber
                  v-model="editRow(data).draftYear"
                  :useGrouping="false"
                  inputClass="w-8rem"
                  placeholder="Required"
                  @focus="ensureEditRow(data)"
                />
              </template>
            </Column>
            <Column field="source" header="Source" sortable style="width: 120px" />
            <Column field="status" header="Status" sortable style="width: 140px" />
            <Column header="" style="width: 360px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button v-if="data.status === 'RECOMMENDED'" label="Approve" icon="pi pi-check" size="small" severity="success" @click="reviewNeed(data, 'APPROVED')" />
                  <Button v-if="data.status === 'RECOMMENDED'" label="Reject" icon="pi pi-times" size="small" severity="secondary" @click="reviewNeed(data, 'REJECTED')" />
                  <Button label="Save" icon="pi pi-save" size="small" @click="saveNeed(data)" />
                  <Button label="Remove" icon="pi pi-trash" size="small" severity="danger" @click="deleteNeed(data)" />
                </div>
              </template>
            </Column>
          </DataTable>

          <div v-if="!store.isLoading && store.persistedNeeds.length === 0" class="opacity-70 mt-2">
            No saved needs yet. Apply a suggestion above to create one quickly.
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

