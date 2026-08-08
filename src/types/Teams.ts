// types/teams.ts

export interface Team {
  code: string
  name: string
  city: string
  conference: 'AFC' | 'NFC'
  division: 'East' | 'North' | 'South' | 'West'
  color: string
}

export interface Division {
  name: string
  teams: Team[]
}

export interface Conference {
  name: string
  abbreviation: 'AFC' | 'NFC'
  color: string
  teams: Team[]
  divisions: Division[]
}

export type TeamCode = string
export type ConferenceType = 'AFC' | 'NFC'
export type DivisionType = 'East' | 'North' | 'South' | 'West'

export interface TeamSelection {
  selectedTeams: TeamCode[]
  currentRound: number
  draftMode: 'live' | 'simulation'
}

export interface DraftSettings {
  startingRound: number
  selectedTeams: TeamCode[]
  trackingMode: 'live' | 'simulation'
  autoRefresh: boolean
  showNotifications: boolean
}