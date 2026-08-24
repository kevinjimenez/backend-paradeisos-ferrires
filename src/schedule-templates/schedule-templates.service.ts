import { Injectable, Logger } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { ScheduleTemplateResponse } from './interfaces/schedule-template-response.interface';
import { ScheduleTemplatesRepository } from './schedule-templates.repository';

@Injectable()
export class ScheduleTemplatesService {
  private readonly logger = new Logger(ScheduleTemplatesService.name);

  constructor(
    private readonly scheduleTemplatesRepository: ScheduleTemplatesRepository,
  ) {}

  async findAll(): Promise<ScheduleTemplateResponse[]> {
    try {
      const data = await this.scheduleTemplatesRepository.findAllBasic();

      return data;
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        'Failed to fetch schedule templates',
      );
    }
  }
}
