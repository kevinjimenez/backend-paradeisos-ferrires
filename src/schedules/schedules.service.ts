import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';
import { ScheduleResponse } from './interfaces/schedule-response.interface';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private databasesService: DatabasesService) {}

  async findAll(
    filters: SchedulesFilterDto,
  ): Promise<ApiResponse<ScheduleResponse[]>> {
    try {
      const scheduleWithRelations = {
        id: true,
        departure_time: true,
        arrival_time: true,
        available_seats: true,
        ferries: {
          select: {
            name: true,
            amenities: true,
            type: true,
          },
        },
        routes: {
          select: {
            base_price_national: true,
          },
        },
      };
      const where = this.buildWhereFromFilters(filters);
      const data = await this.databasesService.schedules.findMany({
        select: scheduleWithRelations,
        where,
      });

      return { data };
    } catch (error) {
      this.logger.error('Error fetching schedules', error);
      throw new InternalServerErrorException('Failed to fetch schedules');
    }
  }

  private buildWhereFromFilters(
    filters: SchedulesFilterDto,
  ): Prisma.schedulesWhereInput {
    const { departureDate, from, to } = filters;
    const query: Prisma.schedulesWhereInput = {};

    // Date filter
    if (departureDate) {
      const startOfDay = new Date(departureDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      query.departure_date = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    // Routes filter
    if (from || to) {
      query.routes = {
        ...(from && { origin_port_id: from }),
        ...(to && { destination_port_id: to }),
      };
    }

    return query;
  }
}
