import { resolveTeamBadge } from '@/domain/team/teamBadge';
import type { UpcomingGameUI } from '@/util/schedule/upcomingGamesHelpers';

export type GameMarketLabel = 'LOCAL' | 'NATIONAL' | 'REGIONAL';

export interface ViewerLocation {
  readonly available: boolean;
  readonly city: string | null;
  readonly region: string | null;
  readonly regionCode: string | null;
  readonly countryCode: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly timezone: string | null;
}

interface TeamMarket {
  readonly latitude: number;
  readonly longitude: number;
}

// Approximate home-market centers. Radius-based matching handles nearby suburbs
// and cross-state metros such as Kansas City better than city-name matching.
const TEAM_MARKETS: Readonly<Record<string, TeamMarket>> = {
  ARI: { latitude: 33.4484, longitude: -112.0740 },
  ATL: { latitude: 33.7490, longitude: -84.3880 },
  BAL: { latitude: 39.2904, longitude: -76.6122 },
  BUF: { latitude: 42.8864, longitude: -78.8784 },
  CAR: { latitude: 35.2271, longitude: -80.8431 },
  CHI: { latitude: 41.8781, longitude: -87.6298 },
  CIN: { latitude: 39.1031, longitude: -84.5120 },
  CLE: { latitude: 41.4993, longitude: -81.6944 },
  DAL: { latitude: 32.7767, longitude: -96.7970 },
  DEN: { latitude: 39.7392, longitude: -104.9903 },
  DET: { latitude: 42.3314, longitude: -83.0458 },
  GB: { latitude: 44.5133, longitude: -88.0133 },
  HOU: { latitude: 29.7604, longitude: -95.3698 },
  IND: { latitude: 39.7684, longitude: -86.1581 },
  JAX: { latitude: 30.3322, longitude: -81.6557 },
  KC: { latitude: 39.0997, longitude: -94.5786 },
  LV: { latitude: 36.1699, longitude: -115.1398 },
  LAC: { latitude: 34.0522, longitude: -118.2437 },
  LAR: { latitude: 34.0522, longitude: -118.2437 },
  MIA: { latitude: 25.7617, longitude: -80.1918 },
  MIN: { latitude: 44.9778, longitude: -93.2650 },
  NE: { latitude: 42.3601, longitude: -71.0589 },
  NO: { latitude: 29.9511, longitude: -90.0715 },
  NYG: { latitude: 40.7128, longitude: -74.0060 },
  NYJ: { latitude: 40.7128, longitude: -74.0060 },
  PHI: { latitude: 39.9526, longitude: -75.1652 },
  PIT: { latitude: 40.4406, longitude: -79.9959 },
  SEA: { latitude: 47.6062, longitude: -122.3321 },
  SF: { latitude: 37.7749, longitude: -122.4194 },
  TB: { latitude: 27.9506, longitude: -82.4572 },
  TEN: { latitude: 36.1627, longitude: -86.7816 },
  WAS: { latitude: 38.9072, longitude: -77.0369 },
};

const LOCAL_MARKET_RADIUS_MILES = 120;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DFW_CITY_NAMES = new Set([
  'addison', 'allen', 'arlington', 'bedford', 'carrollton', 'cedar hill',
  'coppell', 'dallas', 'desoto', 'duncanville', 'euless', 'farmers branch',
  'flower mound', 'fort worth', 'frisco', 'garland', 'grand prairie',
  'grapevine', 'irving', 'keller', 'lewisville', 'mansfield', 'mckinney',
  'mesquite', 'plano', 'richardson', 'southlake',
]);

function normalizeLocationName(value: string | null): string {
  return value?.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '') ?? '';
}

function viewerIsKnownDallasFortWorth(viewer: ViewerLocation): boolean {
  const region = (viewer.regionCode ?? '').trim().toUpperCase();
  if (region !== 'TX') return false;
  return DFW_CITY_NAMES.has(normalizeLocationName(viewer.city));
}

function canonicalTeamAbbreviation(teamValue: string): string | null {
  const direct = teamValue.trim().toUpperCase();
  if (TEAM_MARKETS[direct]) return direct;
  return resolveTeamBadge(teamValue)?.abbreviation ?? null;
}

interface TeamLocalDiagnostic {
  readonly input: string;
  readonly abbreviation: string | null;
  readonly knownDfwCityMatch: boolean;
  readonly distanceMiles: number | null;
  readonly local: boolean;
}

function teamLocalDiagnostic(teamValue: string, viewer: ViewerLocation | null): TeamLocalDiagnostic {
  const abbreviation = canonicalTeamAbbreviation(teamValue);
  if (!viewer?.available || !abbreviation) {
    return { input: teamValue, abbreviation, knownDfwCityMatch: false, distanceMiles: null, local: false };
  }

  const knownDfwCityMatch = abbreviation === 'DAL' && viewerIsKnownDallasFortWorth(viewer);
  if (knownDfwCityMatch) {
    return { input: teamValue, abbreviation, knownDfwCityMatch, distanceMiles: null, local: true };
  }

  if (viewer.latitude === null || viewer.longitude === null) {
    return { input: teamValue, abbreviation, knownDfwCityMatch, distanceMiles: null, local: false };
  }

  const market = TEAM_MARKETS[abbreviation];
  if (!market) {
    return { input: teamValue, abbreviation, knownDfwCityMatch, distanceMiles: null, local: false };
  }

  const miles = distanceMiles(viewer.latitude, viewer.longitude, market.latitude, market.longitude);
  return {
    input: teamValue,
    abbreviation,
    knownDfwCityMatch,
    distanceMiles: Math.round(miles * 10) / 10,
    local: miles <= LOCAL_MARKET_RADIUS_MILES,
  };
}


export function teamDisplayLabel(abbreviation: string, teamName: string): string {
  const canonical = canonicalTeamAbbreviation(abbreviation) ?? canonicalTeamAbbreviation(teamName) ?? abbreviation.trim().toUpperCase();
  const badge = resolveTeamBadge(canonical, teamName);
  if (!badge) return canonical;

  const nameParts = badge.name.trim().split(/\s+/);
  const nickname = nameParts[nameParts.length - 1];
  return nickname ? `${badge.abbreviation} ${nickname}` : badge.abbreviation;
}

const loggedMarketDecisions = new Set<string>();

export function classifyGameMarket(game: UpcomingGameUI, viewer: ViewerLocation | null): GameMarketLabel {
  const away = teamLocalDiagnostic(game.awayTeamAbbrev, viewer);
  const home = teamLocalDiagnostic(game.homeTeamAbbrev, viewer);
  const result: GameMarketLabel = away.local || home.local
    ? 'LOCAL'
    : game.isPrimetime
      ? 'NATIONAL'
      : 'REGIONAL';

  const debugKey = [
    game.id,
    viewer?.city ?? '',
    viewer?.regionCode ?? '',
    viewer?.latitude ?? '',
    viewer?.longitude ?? '',
    game.awayTeamAbbrev,
    game.homeTeamAbbrev,
    result,
  ].join('|');

  if (!loggedMarketDecisions.has(debugKey)) {
    loggedMarketDecisions.add(debugKey);
    console.info('[UpcomingGames:Market] classification', {
      gameId: game.id,
      matchup: `${game.awayTeamAbbrev} @ ${game.homeTeamAbbrev}`,
      viewer,
      away,
      home,
      isPrimetime: game.isPrimetime,
      localRadiusMiles: LOCAL_MARKET_RADIUS_MILES,
      result,
    });
  }

  return result;
}
