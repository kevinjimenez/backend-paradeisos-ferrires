import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateUtil } from './../common/utils/date.util';
import { SchedulesRepository } from './../schedules/schedules.repository';
import { ScheduleTemplatesRepository } from './../schedule-templates/schedule-templates.repository';
import { ActiveScheduleTemplate } from './../schedule-templates/interfaces/schedule-template-response.interface';

const GENERATION_WINDOW_DAYS = 120;

@Injectable()
export class ScheduleGeneratorService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ScheduleGeneratorService.name);

  constructor(
    private readonly scheduleTemplatesRepository: ScheduleTemplatesRepository,
    private readonly schedulesRepository: SchedulesRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.generateUpcomingSchedules();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateUpcomingSchedules() {
    this.logger.log('Starting schedule generation...');

    try {
      const templates = await this.scheduleTemplatesRepository.findActive();
      let totalCreated = 0;

      for (const template of templates) {
        totalCreated += await this.generateForTemplate(template);
      }

      this.logger.log(
        `Schedule generation done. ${totalCreated} schedules created.`,
      );
    } catch (error) {
      this.logger.error('Error generating schedules:', error);
    }
  }

  private async generateForTemplate(
    template: ActiveScheduleTemplate,
  ): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + GENERATION_WINDOW_DAYS);

    const lastGenerated =
      await this.scheduleTemplatesRepository.findLastGeneratedDepartureDate(
        template.id,
      );

    const cursor = lastGenerated ? new Date(lastGenerated) : new Date(today);
    if (lastGenerated) {
      cursor.setHours(0, 0, 0, 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    if (cursor < today) {
      cursor.setTime(today.getTime());
    }

    let created = 0;
    while (cursor <= horizon) {
      const departureAt = DateUtil.toGalapagosInstant(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        template.departure_hour,
        template.departure_minute,
      );
      const arrivalAt = new Date(
        departureAt.getTime() + template.routes.duration_minutes * 60 * 1000,
      );

      await this.schedulesRepository.create({
        route_id: template.route_id,
        ferry_id: template.ferry_id,
        schedule_template_id: template.id,
        departure_date: departureAt,
        departure_time: departureAt,
        arrival_time: arrivalAt,
        total_capacity: template.ferries.capacity,
        available_seats: template.ferries.capacity,
        status: 'scheduled',
        notes: template.notes ?? undefined,
      });
      created++;

      cursor.setDate(cursor.getDate() + 1);
    }

    return created;
  }
}
