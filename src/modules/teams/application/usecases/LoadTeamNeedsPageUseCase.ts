import { TeamNeedsApi } from '../../infrastructure/TeamNeedsApi'
import type { TeamNeedsPageDto } from '../../domain/dtos/TeamNeedDtos'

export class LoadTeamNeedsPageUseCase {
  public constructor(private readonly api: TeamNeedsApi) {}

  public async execute(teamId: number, draftYear: number, evaluationYear?: number): Promise<TeamNeedsPageDto> {
    return this.api.getNeedsPage(teamId, draftYear, evaluationYear)
  }
}
