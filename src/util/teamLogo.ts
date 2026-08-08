/**
 * @deprecated Team artwork is no longer used by the DPA client.
 * Prefer TeamBadge + resolveTeamBadge from @/domain/team/teamBadge.
 */
export interface TeamRef {
  name: string
  conference?: string
}

/**
 * @deprecated Kept temporarily for store compatibility while callers migrate.
 * logoUrl is intentionally always empty so this helper can never render team artwork.
 */
export interface TeamLogoInfo {
  shortName: string
  logoUrl: string
}

export function getTeamShortName(teamName: string): string {
  const parts = teamName.trim().split(/\s+/)
  return parts.at(-1) ?? 'Unknown'
}

/** @deprecated Use TeamBadge instead. */
export function getTeamLogoInfo(team: TeamRef | null | undefined): TeamLogoInfo {
  return {
    shortName: team?.name ? getTeamShortName(team.name) : 'Unknown',
    logoUrl: '',
  }
}
