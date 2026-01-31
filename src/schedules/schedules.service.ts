import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { DatabasesService } from './../databases/databases.service';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';

@Injectable()
export class SchedulesService {
  constructor(private databasesService: DatabasesService) {}

  async findAll(filters: SchedulesFilterDto) {
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
