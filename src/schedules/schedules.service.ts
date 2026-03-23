import { Injectable, Logger } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { Prisma } from './../databases/generated/prisma/client';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';
import { ScheduleResponse } from './interfaces/schedule-response.interface';
import { SchedulesRepository } from './schedules.repository';
import { ScheduleSpecifications } from './specifications/schedule.specifications';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private readonly schedulesRepository: SchedulesRepository) {}

  async findAll(filters: SchedulesFilterDto): Promise<ScheduleResponse[]> {
    try {
      const where = this.buildWhereFromFilters(filters);
      const data = await this.schedulesRepository.findWithFilters(where);

      return data;
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        'Failed to fetch schedules',
      );
    }
  }

  private buildWhereFromFilters(
    filters: SchedulesFilterDto,
  ): Prisma.schedulesWhereInput {
    const { departureDate, from, to } = filters;
    const specs: Prisma.schedulesWhereInput[] = [];

    if (departureDate) {
      specs.push(ScheduleSpecifications.byDepartureDate(departureDate));
    }

    if (from) {
      specs.push(ScheduleSpecifications.byOriginPort(from));
    }

    if (to) {
      specs.push(ScheduleSpecifications.byDestinationPort(to));
    }

    return ScheduleSpecifications.combine(...specs);
  }
}
