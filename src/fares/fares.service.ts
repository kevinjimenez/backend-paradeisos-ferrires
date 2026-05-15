import { Injectable, Logger } from '@nestjs/common';
import { FaresRepository } from './fares.repository';
import { handleServiceError } from '../common/utils/service-error.handler';
import { QueryParamsDto } from '../common/dtos/query-params.dto';

@Injectable()
export class FaresService {
  private readonly logger = new Logger(FaresService.name);
  constructor(private readonly faresRepository: FaresRepository) {}

  async findAll({ is_active = true }: QueryParamsDto = {}) {
    try {
      return await this.faresRepository.findAllWithFilters(is_active);
    } catch (error) {
      return handleServiceError(error, this.logger, 'Failed to fetch fares');
    }
  }

  async findById(id: string) {
    try {
      return await this.faresRepository.findById(id);
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        `Failed to fetch fare ${id}`,
      );
    }
  }
}
