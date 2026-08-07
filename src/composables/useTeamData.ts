// composables/useTeamData.ts
import { computed } from 'vue'
import type { Conference, Division, Team } from '@/types/Teams'

export function useTeamData(options: { enableLogos?: boolean } = {}) {
  const { enableLogos = true } = options

  // Team colors mapping
  const teamColors = {
    ARI: '#97233F', ATL: '#A71930', BAL: '#241773', BUF: '#00338D',
    CAR: '#0085CA', CHI: '#0B162A', CIN: '#FB4F14', CLE: '#FF3C00',
    DAL: '#002244', DEN: '#FB4F14', DET: '#0076B6', GB: '#203731',
    HOU: '#03202F', IND: '#002C5F', JAX: '#006778', KC: '#E31837',
    LAC: '#0080C6', LAR: '#003594', LV: '#000000', MIA: '#008E97',
    MIN: '#4F2683', NE: '#002244', NO: '#D3BC8D', NYG: '#0B2265',
    NYJ: '#125740', PHI: '#004C54', PIT: '#FFB612', SF: '#AA0000',
    SEA: '#002244', TB: '#D50A0A', TEN: '#0C2340', WAS: '#773141'
  }

  // Team name to image mapping (using the last word of team name)
  const teamImageMap = {
    // AFC Teams
    BAL: 'Ravens.avif',
    BUF: 'Bills.avif', 
    CIN: 'Bengals.avif',
    CLE: 'Browns.avif',
    DEN: 'Broncos.avif',
    HOU: 'Texans.avif',
    IND: 'Colts.avif',
    JAX: 'Jaguars.avif',
    KC: 'Chiefs.avif',
    LAC: 'Chargers.webp', // Exception: webp format
    LV: 'Raiders.avif',
    MIA: 'Dolphins.avif',
    NE: 'Patriots.avif',
    NYJ: 'Jets.avif',
    PIT: 'Steelers.avif',
    TEN: 'Titans.avif',
    
    // NFC Teams  
    ARI: 'Cardinals.avif',
    ATL: 'Falcons.avif',
    CAR: 'Panthers.avif',
    CHI: 'Bears.avif',
    DAL: 'Cowboys.avif',
    DET: 'Lions.avif',
    GB: 'Packers.avif',
    LAR: 'Rams.avif',
    MIN: 'Vikings.avif',
    NO: 'Saints.avif',
    NYG: 'Giants.avif',
    PHI: 'Eagles.avif',
    SEA: 'Seahawks.avif',
    SF: '49ers.avif',
    TB: 'Buccaneers.avif',
    WAS: 'Washington.avif'
  }

  // Helper function to create team with correct image path
  const createTeam = (code: string, name: string, city: string, conference: 'AFC' | 'NFC', division: 'East' | 'North' | 'South' | 'West'): Team => {
    const team: Team = {
      code,
      name,
      city,
      conference,
      division,
      color: teamColors[code as keyof typeof teamColors]
    }
    
    if (enableLogos) {
      const conferenceCode = conference.toLowerCase() // "afc" or "nfc"
      const lastWordOfTeamName = teamImageMap[code as keyof typeof teamImageMap]
      // Use public folder path for Vite
      team.logoUrl = ''
    }
    
    return team
  }

  // Team data structure with correct image paths
  const teamData: Team[] = [
    // AFC East
    createTeam('BUF', 'Bills', 'Buffalo', 'AFC', 'East'),
    createTeam('MIA', 'Dolphins', 'Miami', 'AFC', 'East'),
    createTeam('NE', 'Patriots', 'New England', 'AFC', 'East'),
    createTeam('NYJ', 'Jets', 'New York', 'AFC', 'East'),
    
    // AFC North
    createTeam('BAL', 'Ravens', 'Baltimore', 'AFC', 'North'),
    createTeam('CIN', 'Bengals', 'Cincinnati', 'AFC', 'North'),
    createTeam('CLE', 'Browns', 'Cleveland', 'AFC', 'North'),
    createTeam('PIT', 'Steelers', 'Pittsburgh', 'AFC', 'North'),
    
    // AFC South
    createTeam('HOU', 'Texans', 'Houston', 'AFC', 'South'),
    createTeam('IND', 'Colts', 'Indianapolis', 'AFC', 'South'),
    createTeam('JAX', 'Jaguars', 'Jacksonville', 'AFC', 'South'),
    createTeam('TEN', 'Titans', 'Tennessee', 'AFC', 'South'),
    
    // AFC West
    createTeam('DEN', 'Broncos', 'Denver', 'AFC', 'West'),
    createTeam('KC', 'Chiefs', 'Kansas City', 'AFC', 'West'),
    createTeam('LV', 'Raiders', 'Las Vegas', 'AFC', 'West'),
    createTeam('LAC', 'Chargers', 'Los Angeles', 'AFC', 'West'),
    
    // NFC East
    createTeam('DAL', 'Cowboys', 'Dallas', 'NFC', 'East'),
    createTeam('NYG', 'Giants', 'New York', 'NFC', 'East'),
    createTeam('PHI', 'Eagles', 'Philadelphia', 'NFC', 'East'),
    createTeam('WAS', 'Commanders', 'Washington', 'NFC', 'East'),
    
    // NFC North
    createTeam('CHI', 'Bears', 'Chicago', 'NFC', 'North'),
    createTeam('DET', 'Lions', 'Detroit', 'NFC', 'North'),
    createTeam('GB', 'Packers', 'Green Bay', 'NFC', 'North'),
    createTeam('MIN', 'Vikings', 'Minnesota', 'NFC', 'North'),
    
    // NFC South
    createTeam('ATL', 'Falcons', 'Atlanta', 'NFC', 'South'),
    createTeam('CAR', 'Panthers', 'Carolina', 'NFC', 'South'),
    createTeam('NO', 'Saints', 'New Orleans', 'NFC', 'South'),
    createTeam('TB', 'Buccaneers', 'Tampa Bay', 'NFC', 'South'),
    
    // NFC West
    createTeam('ARI', 'Cardinals', 'Arizona', 'NFC', 'West'),
    createTeam('LAR', 'Rams', 'Los Angeles', 'NFC', 'West'),
    createTeam('SF', '49ers', 'San Francisco', 'NFC', 'West'),
    createTeam('SEA', 'Seahawks', 'Seattle', 'NFC', 'West')
  ]

  // Computed conferences with organized structure
  const conferences = computed<Conference[]>(() => {
    const afcTeams = teamData.filter(team => team.conference === 'AFC')
    const nfcTeams = teamData.filter(team => team.conference === 'NFC')

    const createDivisions = (teams: Team[]): Division[] => {
      const divisions = ['East', 'North', 'South', 'West']
      return divisions.map(divisionName => ({
        name: divisionName,
        teams: teams.filter(team => team.division === divisionName)
      }))
    }

    return [
      {
        name: 'American Football Conference',
        abbreviation: 'AFC' as const,
        color: '#FF0000',
        logoUrl: enableLogos ? '' : undefined,
        teams: afcTeams,
        divisions: createDivisions(afcTeams)
      },
      {
        name: 'National Football Conference',
        abbreviation: 'NFC' as const,
        color: '#0000FF',
        logoUrl: enableLogos ? '' : undefined,
        teams: nfcTeams,
        divisions: createDivisions(nfcTeams)
      }
    ]
  })

  // Helper functions
  const getTeamByCode = (code: string): Team | undefined => {
    return teamData.find(team => team.code === code)
  }

  const getTeamsByConference = (conference: 'AFC' | 'NFC'): Team[] => {
    return teamData.filter(team => team.conference === conference)
  }

  const getTeamsByDivision = (conference: 'AFC' | 'NFC', division: string): Team[] => {
    return teamData.filter(team => team.conference === conference && team.division === division)
  }

  const getAllTeamCodes = (): string[] => {
    return teamData.map(team => team.code)
  }

  return {
    teamData,
    teamColors,
    conferences,
    getTeamByCode,
    getTeamsByConference,
    getTeamsByDivision,
    getAllTeamCodes
  }
}