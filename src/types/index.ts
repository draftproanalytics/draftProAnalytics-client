// src/types/index.ts
export interface ApiResponse<T, P = any> {
  success: boolean
  data: T
  pagination?: P
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta | null
}

// Updated to match your backend structure
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
export interface Game {
  // Game fields
  id: number;
  seasonYear: string;
  gameWeek?: number | null;
  seasonType?: number | null;
  gameDate?: Date | string | null;
  homeTeamId: number;
  awayTeamId: number;
  gameLocation?: string | null;
  gameCity?: string | null;
  gameStateProvince?: string | null;
  gameCountry?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  gameStatus?: string | null;
  isPlayoff?: boolean;
  playoffRound?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  
  // Relations
  homeTeam: {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    conference?: string | null;
    division?: string | null;
    stadium?: string | null;
  };
  
  awayTeam: {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    conference?: string | null;
    division?: string | null;
    stadium?: string | null;
  };
}

export interface Player {
  id?: number
  firstName: string
  lastName: string
  age: number
  height: number
  weight: number
  handSize: number
  armLength: number
  homeCity: string
  homeState: string
  university: string
  yearEnteredLeague: number
  position: string
  team?: Team
  awards?: PlayerAward[]
  pick?: DraftPick
  combineScore?: CombineScore
}




export interface PlayerAward {
  id?: number
  playerId: number
  awardName?: string
  yearAwarded?: number
  displayName?: string
  isRecentAward?: boolean
}

export interface PlayerTeam {
  id: number
  playerId: number
  teamId: number
  jerseyNumber?: number | null
  currentTeam: boolean
  isActive: boolean
  startYear: number | null
  endYear: number | null
  contractValue?: number | null
  contractLength?: number | null
  team?: {
    id: number
    name: string
    city: string
    conference?: string | null
    division?: string | null
    fullName: string
    abbreviation?: string | null
  } | null
}

export interface CreatePlayerTeam {
  playerId: number
  teamId: number
  currentTeam: boolean
  isActive: boolean
  startYear?: number
  endYear?: number
}



export type ProspectDraftStatus = 'PRE_DRAFT' | 'DRAFTED' | 'UDFA'

export interface Prospect {
  id?: number
  fullName?: string
  firstName: string
  lastName: string
  position: string
  college: string
  homeCity?: string
  homeState?: string
  drafted: boolean
  draftStatus?: ProspectDraftStatus
  draftYear?: number
  teamId?: number
  draftPickId?: number
  hasCompleteCombineScores?: boolean
  athleteScore?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface ProspectListFilters {
  draftYear?: number
  position?: string
  college?: string
  playerName?: string
}

export interface ProspectRankingSummary {
  source: string
  overallRank: number
  positionRank: number | null
  grade: number | null
}

export interface ProspectProfile {
  prospect: Prospect & { id: number; fullName: string }
  combine: {
    id: number | null
    height: number | null
    weight: number | null
    handSize: number | null
    armLength: number | null
    fortyTime: number | null
    tenYardSplit: number | null
    twentyYardShuttle: number | null
    threeCone: number | null
    verticalLeap: number | null
    broadJump: number | null
    benchPress: number | null
    source: 'COMBINE_SCORE' | 'NONE'
  }
  rankings: ProspectRankingSummary[]
  b4me: {
    scoringMode: string
    coachabilityTier: string | null
    rfaTier: string | null
    rvaTier: string | null
    finalB4MeScore: number | null
    computedAt: string
  } | null
  draftHistory: Array<{
    id: number
    draftYear: number
    round: number
    pickInRound: number
    pickNumber: number
    status: string
    currentTeamId: number
    selectedAt: string | null
  }>
}

export interface Team {
  id?: number
  name: string
  city: string
  state: string
  conference: string
  division: string
  stadium: string
  country: string
  scheduleId?: number
}

export interface TeamNeed {
  id: number
  teamId: number
  draftYear: Date
  position: string
  priority: number
  createdDate: Date
  updatedAt: Date
}

export interface PostSeasonResult {
  id: number
  playoffYear: number
  lastRoundReached?: string
  winLose?: string
  opponentScore?: number
  teamScore?: number
  teamId?: number
}

export interface Schedule {
  id?: number
  teamId?: number
  seasonYear: string
  oppTeamId: number
  oppTeamConference?: string
  oppTeamDivision?: string
  scheduleWeek?: number
  gameDate?: Date
  gameCity?: string
  gameStateProvince?: string
  gameCountry?: string
  gameLocation?: string
  wonLostFlag?: string
  homeOrAway?: string
  oppTeamScore?: number
  teamScore: number
  result?: string
}

export interface DraftPick {
  id?: number
  draftYear: number
  round: number
  pickNumber: number
  playerId?: number
  prospectId?: number
  teamId: number | undefined
  playerFirstName?: string
  playerLastName?: string
  position?: string
  pickFrom: number
  pickTo: number
  combineScore: number
}

export interface DraftSelection {
  id?: number;
  draftYear: number;
  draftRound: number;
  pickNumber: number;
  playerId: number;
  teamId: number;
  teamName?: string;
  playerName?: string;
  position: string;
  college?: string;
}

export interface CombineScore {
  id?: number
  playerId?: number
  prospectId?: number
  height?: number
  weight?: number
  handSize?: number
  armLength?: number
  fortyTime?: number
  tenYardSplit?: number
  verticalLeap?: number
  broadJump?: number
  threeCone?: number
  twentyYardShuttle?: number
  benchPress?: number
  overallAthleticScore?: number
  isCompleteWorkout?: boolean
}

export type CombineMeasurementStatus = 'MISSING' | 'PARTIAL' | 'COMPLETE'

export interface CombineScoreProspectSummary {
  id: number
  firstName: string
  lastName: string
  fullName: string
  position: string
  college: string
  draftYear?: number
  draftStatus?: ProspectDraftStatus
}

export interface CombineScoreWorkspaceItem {
  prospect: CombineScoreProspectSummary
  combineScore?: CombineScore
  combineStatus: CombineMeasurementStatus
}

export interface CombineScoreWorkspaceFilters {
  draftYear?: number
  position?: string
  college?: string
  playerName?: string
  combineStatus?: CombineMeasurementStatus
  sortField?: 'name' | 'draftYear' | 'position' | 'college' | 'height' | 'weight' | 'handSize' | 'armLength' | 'fortyTime' | 'tenYardSplit' | 'verticalLeap' | 'broadJump' | 'threeCone' | 'twentyYardShuttle' | 'benchPress'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface CombineScoreWorkspacePagination {
  page: number
  limit: number
  total: number
  pages: number
}

// Additional types to add to src/types/index.ts

export interface TeamStats {
  overall: GameRecord
  conference: GameRecord
  division: GameRecord
}

export interface GameRecord {
  won: number
  lost: number
}

export interface GameResult {
  isWin: boolean
  teamScore: number
  opponentScore: number
  opponent: TeamInfo
}

export interface TeamInfo {
  id: number
  name: string
  conference?: string | null
  division?: string | null
  city?: string | null
  state?: string | null
  stadium?: string | null
}

export interface StatsCalculationContext {
  teamId: number
  seasonYear: string
  team: TeamInfo
}

export type CrudMode = 'read' | 'create' | 'edit' | 'delete'
