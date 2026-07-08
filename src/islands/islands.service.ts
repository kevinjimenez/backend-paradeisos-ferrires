import { Injectable, Logger } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { IslandResponse } from './interfaces/island-response.interface';
import { IslandsRepository } from './islands.repository';

@Injectable()
export class IslandsService {
  private readonly logger = new Logger(IslandsService.name);

  constructor(private readonly islandsRepository: IslandsRepository) {}

  async findAll(): Promise<IslandResponse[]> {
    try {
      const data = await this.islandsRepository.findAllBasic();

      return data;
    } catch (error) {
      return handleServiceError(error, this.logger, 'Failed to fetch ports');
    }
  }
}
