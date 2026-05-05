import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FaresRepository } from './fares.repository';
import { handleServiceError } from '../common/utils/service-error.handler';

@Injectable()
export class FaresService {
  private readonly logger = new Logger(FaresService.name);
  constructor(private readonly faresRepository: FaresRepository) {}

  async findAll() {
    try {
      return await this.faresRepository.findAll();
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
