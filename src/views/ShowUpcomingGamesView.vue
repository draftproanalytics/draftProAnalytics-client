<!-- src/views/ShowUpcomingGamesView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import PlayoffGameDetailsDialog from '@/modules/playoffs/presentation/components/PlayoffGameDetailsDialog.vue';
import { useUpcomingGamesController } from '@/composables/schedule/useUpcomingGamesController';
import { preseasonWeekOptions } from '@/modules/jobs/domain/NflJobLabels';
import { getViewerLocation } from '@/services/schedule/viewerMarketService';
import { classifyGameMarket, teamDisplayLabel, type ViewerLocation } from '@/util/schedule/gameMarket';
import type { UpcomingGameUI } from '@/util/schedule/upcomingGamesHelpers';

const controller = useUpcomingGamesController();
const { loading } = controller;

const displayedWeekOptions = computed<{ label: string; value: number | null }[]>(() => {
  switch (Number(controller.selectedSeasonType.value)) {
    case 1:
      return [{ label: 'All Preseason', value: null }, ...preseasonWeekOptions];
    case 3:
      return Array.from({ length: 5 }, (_, i) => ({ label: `Postseason Week ${i + 1}`, value: i + 1 }));
    default:
      return Array.from({ length: 18 }, (_, i) => ({ label: `Week ${i + 1}`, value: i + 1 }));
  }
});

const selectedGameId = ref<number | null>(null);
const gameDetailsVisible = ref(false);
const selectedGameTitle = ref<string | null>(null);
const viewerLocation = ref<ViewerLocation | null>(null);

const openGameDetails = (game: UpcomingGameUI): void => {
  selectedGameId.value = game.id;
  selectedGameTitle.value = `${game.awayTeamName} @ ${game.homeTeamName}`;
  gameDetailsVisible.value = true;
};

const marketFor = (game: UpcomingGameUI): string => classifyGameMarket(game, viewerLocation.value);

const shouldShowScore = (game: UpcomingGameUI): boolean =>
  game.status.trim().toLowerCase() !== 'scheduled';

const readableTextColor = (background: string): string => {
  const normalized = background.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#ffffff';
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? '#000000' : '#ffffff';
};

onMounted(async () => {
  console.info('[UpcomingGames:Market] ShowUpcomingGamesView mounted');
  try {
    viewerLocation.value = await getViewerLocation();
    console.info('[UpcomingGames:Market] active viewer location', viewerLocation.value);
  } catch (error: unknown) {
    viewerLocation.value = null;
    console.warn('[UpcomingGames:Market] Unable to determine viewing market:', error);
  }
});
</script>

<template>
  <div class="p-4 upcoming-games-page">
    <div class="upcoming-games-container">
    <h2 class="text-2xl font-bold mb-3">Upcoming NFL Games</h2>

    <div class="controls-row">
      <select v-model="controller.selectedYear.value" class="control-select">
        <option v-for="y in [2023, 2024, 2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
      </select>

      <select v-model="controller.selectedSeasonType.value" class="control-select">
        <option :value="1">Preseason</option>
        <option :value="2">Regular Season</option>
        <option :value="3">Postseason</option>
      </select>

      <select v-model="controller.selectedWeek.value" class="control-select">
        <option v-for="opt in displayedWeekOptions" :key="opt.value ?? 'all-preseason'" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <div style="margin-right: -2em">
        <button class="submit-btn" @click="controller.submitControls()">Submit</button>
        <button
          class="refresh-btn"
          :disabled="loading || controller.isAllPreseasonSelected.value"
          :title="controller.isAllPreseasonSelected.value
            ? 'Refresh-by-week is unavailable when all preseason games are selected'
            : undefined"
          @click="controller.runImportScoresWeek"
        >
          Refresh
        </button>
      </div>
    </div>

    <DataTable
      :value="controller.store.games"
      rowGroupMode="subheader"
      groupRowsBy="dateGroupKey"
      :loading="controller.store.isLoading"
      scrollable
      scrollHeight="70vh"
      tableStyle="min-width: 1500px"
      class="upcoming-games-table"
      rowHover
      dataKey="id"
      :rowClass="(data) => controller.isRecentlyUpdated(data.id) ? 'score-updated game-details-row' : 'game-details-row'"
      @row-click="openGameDetails($event.data)"
    >
      <template #groupheader="{ data }">
        <div class="game-date-group-header">{{ data.dateGroupLabel }}</div>
      </template>

      <!-- PrimeVue subheader grouping subtracts one column from its colspan.
           Keep the grouping field as a hidden column so the date header spans
           all seven visible columns, including Last Play. -->
      <Column field="dateGroupKey" style="display: none" headerStyle="display: none" bodyStyle="display: none" />

      <Column header="Time" style="width: 12%">
        <template #body="{ data }">
          <span class="date-time">{{ data.dateFormatted.time }}</span>
        </template>
      </Column>

      <Column header="Away" style="width: 10%" headerClass="away-team-column" bodyClass="away-team-column">
        <template #body="{ data }">
          <span
            class="team-score-badge"
            :class="{ 'winning-team': data.awayWinner }"
            :style="{ backgroundColor: data.teamColorAway, color: readableTextColor(data.teamColorAway) }"
            :title="data.awayTeamName"
          >
            {{ teamDisplayLabel(data.awayTeamAbbrev, data.awayTeamName) }}<span v-if="shouldShowScore(data) && data.awayScore !== null"> ({{ data.awayScore }})</span>
          </span>
        </template>
      </Column>

      <Column header="" style="width: 2%" headerClass="at-column" bodyClass="at-column">
        <template #body><span class="at-symbol">@</span></template>
      </Column>

      <Column header="Home" style="width: 10%" headerClass="home-team-column" bodyClass="home-team-column">
        <template #body="{ data }">
          <span
            class="team-score-badge"
            :class="{ 'winning-team': data.homeWinner }"
            :style="{ backgroundColor: data.teamColorHome, color: readableTextColor(data.teamColorHome) }"
            :title="data.homeTeamName"
          >
            {{ teamDisplayLabel(data.homeTeamAbbrev, data.homeTeamName) }}<span v-if="shouldShowScore(data) && data.homeScore !== null"> ({{ data.homeScore }})</span>
          </span>
        </template>
      </Column>

      <Column header="Market" style="width: 12%">
        <template #body="{ data }">
          <span class="market-label">{{ marketFor(data) }}</span>
        </template>
      </Column>

      <Column header="Status" style="width: 10rem">
        <template #body="{ data }">
          <div class="status-pill" :data-status="data.status">
            <span class="status-main">{{ data.status }}</span>
            <span v-if="data.statusDetail && data.statusDetail !== data.status" class="status-detail">
              {{ data.statusDetail }}
            </span>
          </div>
        </template>
      </Column>

      <Column header="Last Play" headerClass="last-play-column" bodyClass="last-play-column">
        <template #body="{ data }">
          <div
            class="last-play-content"
            :class="{ 'last-play-empty': !data.scoringSummaryShort }"
            :title="data.scoringSummaryShort ?? undefined"
          >
            {{ data.scoringSummaryShort ?? '—' }}
          </div>
        </template>
      </Column>
    </DataTable>

    <div v-if="viewerLocation?.available" class="market-note">
      Local market inferred from {{ viewerLocation.city ?? 'your area' }}<span v-if="viewerLocation.regionCode">, {{ viewerLocation.regionCode }}</span>.
    </div>

    </div>

    <PlayoffGameDetailsDialog
      v-model:visible="gameDetailsVisible"
      :game-id="selectedGameId"
      :fallback-title="selectedGameTitle"
    />
  </div>
</template>

<style scoped>
.upcoming-games-page {
  width: 100%;
  box-sizing: border-box;
}

.upcoming-games-container {
  width: 94%;
  max-width: 1800px;
  margin: 0 auto;
  box-sizing: border-box;
}

:deep(.upcoming-games-table) {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

:deep(.upcoming-games-table .p-datatable-table-container) {
  border-radius: 0.75rem;
}

:deep(.upcoming-games-table .p-datatable-thead > tr > th) {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--p-datatable-header-cell-background, #18181b);
}

:deep(.upcoming-games-table .p-datatable-thead > tr > th:first-child) {
  border-top-left-radius: 0.75rem;
}

:deep(.upcoming-games-table .p-datatable-thead > tr > th:last-child) {
  border-top-right-radius: 0.75rem;
}

:deep(.upcoming-games-table .p-datatable-tbody > tr:last-child > td:first-child) {
  border-bottom-left-radius: 0.75rem;
}

:deep(.upcoming-games-table .p-datatable-tbody > tr:last-child > td:last-child) {
  border-bottom-right-radius: 0.75rem;
}

@media (max-width: 1100px) {
  .upcoming-games-container {
    width: 100%;
  }
}

:deep(.game-details-row) { cursor: pointer; }

.controls-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.control-select {
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #444;
  background-color: #111;
  color: #f5f5f5;
  width: 25%;
}

.submit-btn, .refresh-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.submit-btn { background-color: #054dbd; color: #fff; }
.refresh-btn { background-color: #333; color: #eee; }
.refresh-btn[disabled] { opacity: 0.6; cursor: default; }

.score-highlight { animation: scoreFlash 3s ease-in-out; }
@keyframes scoreFlash {
  0% { background-color: rgba(255, 215, 0, 0.4); box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
  50% { background-color: rgba(255, 215, 0, 0.3); box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
  100% { background-color: rgba(255, 215, 0, 0); box-shadow: none; }
}
:deep(.score-updated) { animation: scoreFlash 3s ease-in-out; background-color: rgba(255, 215, 0, 0.2) !important; }

.game-date-group-header {
  width: 100%;
  padding: 0.65rem 0.25rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
:deep(.p-datatable-row-group-header > td) {
  background: rgba(255, 255, 255, 0.07);
  border-top: 2px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.date-time { font-size: 0.9rem; color: #ddd; white-space: nowrap; }

.team-score-badge {
  display: inline-flex;
  min-width: 92px;
  justify-content: center;
  align-items: center;
  padding: 0.48rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 1rem;
  font-weight: 650;
  letter-spacing: 0.02em;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.winning-team { font-weight: 800; box-shadow: inset 0 -3px 0 rgba(255, 255, 255, 0.5); }
.at-symbol { display: block; text-align: center; font-size: 1.05rem; font-weight: 700; color: #ccc; }
:deep(.away-team-column) {
  text-align: right !important;
  padding-left: 0.25rem !important;
  padding-right: 0.4em !important;
}
:deep(.away-team-column .p-column-header-content) { justify-content: flex-end; }
:deep(.home-team-column) {
  text-align: left !important;
  padding-left: 0.4em !important;
  padding-right: 0.25rem !important;
}
:deep(.home-team-column .p-column-header-content) { justify-content: flex-start; }
:deep(.at-column) {
  width: 1%;
  text-align: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  white-space: nowrap;
}
:deep(.at-column .p-column-header-content) { justify-content: center; }


:deep(.last-play-column) {
  min-width: 70ch;
  width: 90ch;
  max-width: 120ch;
}

:deep(.last-play-column .p-column-header-content) {
  justify-content: flex-start;
}

.last-play-content {
  max-height: 4.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  background: rgba(255, 255, 255, 0.045);
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
  scrollbar-gutter: stable;
}

.last-play-empty {
  color: #9ca3af;
}

.market-label {
  display: inline-block;
  min-width: 92px;
  padding: 0.32rem 0.55rem;
  border-radius: 0.3rem;
  background: #fff;
  color: #000;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.045em;
}

.status-pill {
  display: inline-flex;
  flex-direction: column;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background-color: #222;
  font-size: 0.8rem;
}
.status-pill[data-status='In Progress'] { background-color: #14532d; }
.status-pill[data-status='Final'] { background-color: #1f2937; }
.status-pill[data-status='Postponed'] { background-color: #7f1d1d; }
.status-main { font-weight: 600; color: #f9fafb; }
.status-detail { font-size: 0.75rem; color: #e5e7eb; }
.market-note { margin-top: 0.65rem; font-size: 0.76rem; color: #9ca3af; }
</style>
