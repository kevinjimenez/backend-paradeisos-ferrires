import { Injectable, Logger } from '@nestjs/common';
import { FareExtrasRepository } from './fare-extras.repository';
import { handleServiceError } from '../common/utils/service-error.handler';

@Injectable()
export class FareExtrasService {
  private readonly logger = new Logger(FareExtrasService.name);

  constructor(private readonly fareExtrasRepository: FareExtrasRepository) {}

  async findAll() {
    try {
      return await this.fareExtrasRepository.findAll();
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        'Failed to fetch fare extras',
      );
    }
  }

  async findById(id: string) {
    try {
      return await this.fareExtrasRepository.findById(id);
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        `Failed to fetch fare extra ${id}`,
      );
    }
  }
}
