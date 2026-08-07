export interface TeamRef {
  name: string
  conference: string
}

export interface TeamLogoInfo {
  shortName: string
  logoUrl: string
}

export function getTeamShortName(teamName: string): string {
  const parts = teamName.trim().split(/\s+/)
  return parts[parts.length - 1] || teamName
}

// Logo artwork is intentionally disabled. The short name remains available
// to callers that use this helper for compact team-name display.
export function getTeamLogoInfo(team: TeamRef | null | undefined): TeamLogoInfo {
  if (!team?.name) return { shortName: 'Unknown', logoUrl: '' }
  return { shortName: getTeamShortName(team.name), logoUrl: '' }
}
