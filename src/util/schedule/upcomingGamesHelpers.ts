// src/util/schedule/upcomingGamesHelpers.ts
// -----------------------------------------------------
// Consumes BACKEND NormalizedGameDTO
// Produces FRONTEND UpcomingGameUI (with scoring info)
// -----------------------------------------------------

import { DateTime } from 'luxon';
import { resolveTeamLogo } from '@/util/resolveTeamLogo';
import { resolveTeamBadge } from '@/domain/team/teamBadge'
import type {
  NormalizedGameDTO,
  ScoringPlayDTO,
} from '@/util/schedule/scheduleTypes';

// -----------------------------------------------------
// FRONTEND DTO / UI MODEL
// -----------------------------------------------------
export interface UpcomingGameDto {
  id: number;
  dateFormatted: {
    day: string;
    time: string;
  };
  dateGroupKey: string;
  dateGroupLabel: string;

  homeTeamName: string;
  awayTeamName: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number | null;
  awayScore: number | null;
  homeWinner: boolean;
  awayWinner: boolean;
  homeTeamAbbrev: string;
  awayTeamAbbrev: string;

  status: 'Scheduled' | 'In Progress' | 'Final' | 'Postponed';
  statusDetail: string;

  isPrimetime: boolean;
  primetimeType: 'TNF' | 'SNF' | 'MNF' | null;

  teamColorHome: string;
  teamColorAway: string;

  // NEW: short blurb + full list
  scoringSummaryShort: string | null;
  scoringDetails: string[];
}

export type UpcomingGameUI = UpcomingGameDto;

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function toDateDisplay(dateIso: string | null): {
  formatted: { day: string; time: string };
  groupKey: string;
  groupLabel: string;
} {
  if (!dateIso) {
    return {
      formatted: { day: '', time: '' },
      groupKey: 'date-unavailable',
      groupLabel: 'Date unavailable',
    };
  }

  const dt = DateTime.fromISO(dateIso);
  if (!dt.isValid) {
    return {
      formatted: { day: '', time: '' },
      groupKey: 'date-unavailable',
      groupLabel: 'Date unavailable',
    };
  }

  return {
    formatted: {
      day: dt.toFormat('ccc L/d'), // e.g. "Sun 11/30"
      time: dt.toFormat('h:mm a'), // e.g. "7:15 PM"
    },
    groupKey: dt.toISODate() ?? 'date-unavailable',
    groupLabel: dt.toFormat('cccc, LLLL d'), // e.g. "Thursday, August 20"
  };
}

function mapScoringPlaysToDetails(plays: ScoringPlayDTO[] | undefined): string[] {
  if (!plays || !plays.length) {
    return [];
  }

  return plays.map((p) => {
    const parts: string[] = [];

    // "Q3 10:21"
    if (p.period > 0 || p.clockDisplay) {
      const qLabel = p.period > 0 ? `Q${p.period}` : '';
      const timeLabel = p.clockDisplay || '';
      const when = [qLabel, timeLabel].filter(Boolean).join(' ');
      if (when) {
        parts.push(when);
      }
    }

    // Play text
    if (p.text) {
      parts.push(p.text);
    }

    // "(Score: 21–17)"
    if (p.homeScore != null || p.awayScore != null) {
      parts.push(`(Score: ${p.awayScore ?? '-'}–${p.homeScore ?? '-'})`);
    }

    return parts.join(' — ');
  });
}

// -----------------------------------------------------
// MAIN MAPPER: server DTO → UI model
// -----------------------------------------------------
export function mapUpcomingGamesToUI(events: NormalizedGameDTO[]): UpcomingGameUI[] {
  const chronologicalEvents = [...events].sort((a, b) => {
    const aTime = a.date ? DateTime.fromISO(a.date).toMillis() : Number.MAX_SAFE_INTEGER;
    const bTime = b.date ? DateTime.fromISO(b.date).toMillis() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  return chronologicalEvents.map((e) => {
    const dateDisplay = toDateDisplay(e.date);
    const dateFormatted = e.dateFormatted ?? dateDisplay.formatted;

    const homeLogo =
      e.homeLogoLocal || e.homeLogoEspn || resolveTeamLogo(e.homeTeamName);
    const awayLogo =
      e.awayLogoLocal || e.awayLogoEspn || resolveTeamLogo(e.awayTeamName);

    const homeBadge = resolveTeamBadge(e.homeTeamName);
    const awayBadge = resolveTeamBadge(e.awayTeamName);

    const scoringDetails = mapScoringPlaysToDetails(e.scoringPlays);
    const scoringSummaryShort =
      e.scoringSummaryShort ||
      (scoringDetails.length ? scoringDetails[scoringDetails.length - 1] : null);

    const dto: UpcomingGameDto = {
      id: e.id,
      dateFormatted,
      dateGroupKey: dateDisplay.groupKey,
      dateGroupLabel: dateDisplay.groupLabel,

      homeTeamName: e.homeTeamName,
      awayTeamName: e.awayTeamName,
      homeLogo,
      awayLogo,
      homeScore: e.homeScore,
      awayScore: e.awayScore,
      homeWinner: e.homeWinner,
      awayWinner: e.awayWinner,
      homeTeamAbbrev: homeBadge?.abbreviation ?? e.homeTeamName,
      awayTeamAbbrev: awayBadge?.abbreviation ?? e.awayTeamName,

      status: e.status,
      statusDetail: e.statusDetail,

      isPrimetime: e.isPrimetime,
      primetimeType: e.primetimeType,

      teamColorHome: homeBadge?.primaryColor ?? e.teamColorHome ?? '#444444',
      teamColorAway: awayBadge?.primaryColor ?? e.teamColorAway ?? '#444444',

      scoringSummaryShort,
      scoringDetails,
    };

    return dto;
  });
}

