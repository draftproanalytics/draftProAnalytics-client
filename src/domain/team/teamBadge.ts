export interface TeamBadgeDefinition {
  readonly abbreviation: string
  readonly name: string
  readonly primaryColor: string
  readonly secondaryColor: string
  readonly aliases: readonly string[]
}

const TEAM_BADGES: readonly TeamBadgeDefinition[] = [
  { abbreviation: 'ARI', name: 'Arizona Cardinals', primaryColor: '#97233F', secondaryColor: '#000000', aliases: ['ARI', 'Arizona Cardinals', 'Cardinals'] },
  { abbreviation: 'ATL', name: 'Atlanta Falcons', primaryColor: '#A71930', secondaryColor: '#000000', aliases: ['ATL', 'Atlanta Falcons', 'Falcons'] },
  { abbreviation: 'BAL', name: 'Baltimore Ravens', primaryColor: '#241773', secondaryColor: '#9E7C0C', aliases: ['BAL', 'Baltimore Ravens', 'Ravens'] },
  { abbreviation: 'BUF', name: 'Buffalo Bills', primaryColor: '#00338D', secondaryColor: '#C60C30', aliases: ['BUF', 'Buffalo Bills', 'Bills'] },
  { abbreviation: 'CAR', name: 'Carolina Panthers', primaryColor: '#0085CA', secondaryColor: '#101820', aliases: ['CAR', 'Carolina Panthers', 'Panthers'] },
  { abbreviation: 'CHI', name: 'Chicago Bears', primaryColor: '#0B162A', secondaryColor: '#C83803', aliases: ['CHI', 'Chicago Bears', 'Bears'] },
  { abbreviation: 'CIN', name: 'Cincinnati Bengals', primaryColor: '#FB4F14', secondaryColor: '#000000', aliases: ['CIN', 'Cincinnati Bengals', 'Bengals'] },
  { abbreviation: 'CLE', name: 'Cleveland Browns', primaryColor: '#311D00', secondaryColor: '#FF3C00', aliases: ['CLE', 'Cleveland Browns', 'Browns'] },
  { abbreviation: 'DAL', name: 'Dallas Cowboys', primaryColor: '#003594', secondaryColor: '#869397', aliases: ['DAL', 'Dallas Cowboys', 'Cowboys'] },
  { abbreviation: 'DEN', name: 'Denver Broncos', primaryColor: '#FB4F14', secondaryColor: '#002244', aliases: ['DEN', 'Denver Broncos', 'Broncos'] },
  { abbreviation: 'DET', name: 'Detroit Lions', primaryColor: '#0076B6', secondaryColor: '#B0B7BC', aliases: ['DET', 'Detroit Lions', 'Lions'] },
  { abbreviation: 'GB', name: 'Green Bay Packers', primaryColor: '#203731', secondaryColor: '#FFB612', aliases: ['GB', 'GNB', 'Green Bay Packers', 'Packers'] },
  { abbreviation: 'HOU', name: 'Houston Texans', primaryColor: '#03202F', secondaryColor: '#A71930', aliases: ['HOU', 'Houston Texans', 'Texans'] },
  { abbreviation: 'IND', name: 'Indianapolis Colts', primaryColor: '#002C5F', secondaryColor: '#FFFFFF', aliases: ['IND', 'Indianapolis Colts', 'Colts'] },
  { abbreviation: 'JAX', name: 'Jacksonville Jaguars', primaryColor: '#006778', secondaryColor: '#D7A22A', aliases: ['JAX', 'JAC', 'Jacksonville Jaguars', 'Jaguars'] },
  { abbreviation: 'KC', name: 'Kansas City Chiefs', primaryColor: '#E31837', secondaryColor: '#FFB81C', aliases: ['KC', 'KAN', 'Kansas City Chiefs', 'Chiefs'] },
  { abbreviation: 'LV', name: 'Las Vegas Raiders', primaryColor: '#000000', secondaryColor: '#A5ACAF', aliases: ['LV', 'LVR', 'OAK', 'Las Vegas Raiders', 'Oakland Raiders', 'Raiders'] },
  { abbreviation: 'LAC', name: 'Los Angeles Chargers', primaryColor: '#0080C6', secondaryColor: '#FFC20E', aliases: ['LAC', 'SD', 'Los Angeles Chargers', 'San Diego Chargers', 'Chargers'] },
  { abbreviation: 'LAR', name: 'Los Angeles Rams', primaryColor: '#003594', secondaryColor: '#FFA300', aliases: ['LAR', 'LA', 'STL', 'Los Angeles Rams', 'St. Louis Rams', 'Rams'] },
  { abbreviation: 'MIA', name: 'Miami Dolphins', primaryColor: '#008E97', secondaryColor: '#FC4C02', aliases: ['MIA', 'Miami Dolphins', 'Dolphins'] },
  { abbreviation: 'MIN', name: 'Minnesota Vikings', primaryColor: '#4F2683', secondaryColor: '#FFC62F', aliases: ['MIN', 'Minnesota Vikings', 'Vikings'] },
  { abbreviation: 'NE', name: 'New England Patriots', primaryColor: '#002244', secondaryColor: '#C60C30', aliases: ['NE', 'NWE', 'New England Patriots', 'Patriots'] },
  { abbreviation: 'NO', name: 'New Orleans Saints', primaryColor: '#D3BC8D', secondaryColor: '#101820', aliases: ['NO', 'NOR', 'New Orleans Saints', 'Saints'] },
  { abbreviation: 'NYG', name: 'New York Giants', primaryColor: '#0B2265', secondaryColor: '#A71930', aliases: ['NYG', 'New York Giants', 'Giants'] },
  { abbreviation: 'NYJ', name: 'New York Jets', primaryColor: '#125740', secondaryColor: '#FFFFFF', aliases: ['NYJ', 'New York Jets', 'Jets'] },
  { abbreviation: 'PHI', name: 'Philadelphia Eagles', primaryColor: '#004C54', secondaryColor: '#A5ACAF', aliases: ['PHI', 'Philadelphia Eagles', 'Eagles'] },
  { abbreviation: 'PIT', name: 'Pittsburgh Steelers', primaryColor: '#FFB612', secondaryColor: '#101820', aliases: ['PIT', 'Pittsburgh Steelers', 'Steelers'] },
  { abbreviation: 'SEA', name: 'Seattle Seahawks', primaryColor: '#002244', secondaryColor: '#69BE28', aliases: ['SEA', 'Seattle Seahawks', 'Seahawks'] },
  { abbreviation: 'SF', name: 'San Francisco 49ers', primaryColor: '#AA0000', secondaryColor: '#B3995D', aliases: ['SF', 'SFO', 'San Francisco 49ers', '49ers', 'Niners'] },
  { abbreviation: 'TB', name: 'Tampa Bay Buccaneers', primaryColor: '#D50A0A', secondaryColor: '#FF7900', aliases: ['TB', 'TAM', 'Tampa Bay Buccaneers', 'Buccaneers', 'Bucs'] },
  { abbreviation: 'TEN', name: 'Tennessee Titans', primaryColor: '#0C2340', secondaryColor: '#4B92DB', aliases: ['TEN', 'Tennessee Titans', 'Titans'] },
  { abbreviation: 'WAS', name: 'Washington Commanders', primaryColor: '#5A1414', secondaryColor: '#FFB612', aliases: ['WAS', 'WSH', 'Washington Commanders', 'Washington Football Team', 'Washington Redskins', 'Commanders'] },
]

const normalize = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const BY_ALIAS = new Map<string, TeamBadgeDefinition>()
for (const team of TEAM_BADGES) {
  for (const alias of [team.abbreviation, team.name, ...team.aliases]) {
    BY_ALIAS.set(normalize(alias), team)
  }
}

export interface TeamBadgeInput {
  readonly abbreviation?: string | null
  readonly code?: string | null
  readonly name?: string | null
  readonly fullName?: string | null
  readonly displayName?: string | null
  readonly city?: string | null
}

export function resolveTeamBadge(...inputs: Array<string | TeamBadgeInput | null | undefined>): TeamBadgeDefinition | null {
  for (const input of inputs) {
    if (!input) continue
    const candidates = typeof input === 'string'
      ? [input]
      : [input.abbreviation, input.code, input.fullName, input.displayName, input.name,
          input.city && input.name ? `${input.city} ${input.name}` : null]

    for (const candidate of candidates) {
      if (!candidate) continue
      const direct = BY_ALIAS.get(normalize(candidate))
      if (direct) return direct
    }
  }
  return null
}

export function getAllTeamBadges(): readonly TeamBadgeDefinition[] {
  return TEAM_BADGES
}
