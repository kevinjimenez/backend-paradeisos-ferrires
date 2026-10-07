import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { Prisma } from 'src/databases/generated/prisma/client';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { DatabasesService } from '../databases/databases.service';
import { ActiveScheduleTemplate } from './interfaces/schedule-template-response.interface';

@Injectable()
export class ScheduleTemplatesRepository extends BaseRepository<Prisma.schedule_templatesModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'schedule_templates';
  }

  protected get db() {
    return this.databasesService;
  }

  async findAllBasic(tx?: PrismaTransaction) {
    const database = tx ?? this.db;

    return database.schedule_templates.findMany({
      select: {
        id: true,
        route_id: true,
        ferry_id: true,
        departure_hour: true,
        departure_minute: true,
        is_active: true,
        notes: true,
      },
    });
  }

  async findActive(tx?: PrismaTransaction): Promise<ActiveScheduleTemplate[]> {
    const database = tx ?? this.db;

    return database.schedule_templates.findMany({
      where: { is_active: true },
      select: {
        id: true,
        route_id: true,
        ferry_id: true,
        departure_hour: true,
        departure_minute: true,
        is_active: true,
        notes: true,
        routes: { select: { duration_minutes: true } },
        ferries: { select: { capacity: true } },
      },
    });
  }

  async findLastGeneratedDepartureDate(
    scheduleTemplateId: string,
    tx?: PrismaTransaction,
  ): Promise<Date | null> {
    const database = tx ?? this.db;

    const last = await database.schedules.findFirst({
      where: { schedule_template_id: scheduleTemplateId },
      orderBy: { departure_date: 'desc' },
      select: { departure_date: true },
    });

    return last?.departure_date ?? null;
  }
}
