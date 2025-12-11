import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { DatabasesService } from './../databases/databases.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private databasesService: DatabasesService) {}

  create(createScheduleDto: CreateScheduleDto) {
    return 'This action adds a new schedule';
  }

  async findAll(filters: SchedulesFilterDto) {
    const where = this.buildWhereFromFilters(filters);
    const data = await this.databasesService.schedules.findMany({
      include: {
        ferries: true,
        routes: {
          include: {
            origin_ports: true,
            destination_ports: true,
          },
        },
      },
      where,
    });

    return { data };
  }

  findOne(id: number) {
    return `This action returns a #${id} schedule`;
  }

  update(id: number, updateScheduleDto: UpdateScheduleDto) {
    return `This action updates a #${id} schedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} schedule`;
  }

  private buildWhereFromFilters(
    filters: SchedulesFilterDto,
  ): Prisma.schedulesWhereInput {
    const { departureDate, returnDate, from, to } = filters;

    const dateFilter =
      departureDate || returnDate
        ? {
            departure_date: {
              ...(departureDate && { gte: new Date(departureDate) }),
              ...(returnDate && { lte: new Date(returnDate) }),
            },
          }
        : {};

    const routesFilter =
      from || to
        ? {
            routes: {
              ...(from && { origin_port_id: from }),
              ...(to && { destination_port_id: to }),
            },
          }
        : {};

    return {
      ...dateFilter,
      ...routesFilter,
    };
  }
}
